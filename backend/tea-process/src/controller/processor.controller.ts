/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ProcessorService } from '../service/processor.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBatchDTO, UpdateTealeavesStatusDTO } from '../dto/processor.dto';
import { HarvestModel, UserRole } from '@app/db-utilites';
import { Roles, RolesGuardJWT } from '@app/user-guard';
import { FarmerService } from '../service/farmer.service';

@ApiTags('Processor')
@Controller('processor')
export class ProcessorController {
  constructor(
    private readonly processorService: ProcessorService,
    private readonly farmerService: FarmerService,
  ) {}

  @Roles(UserRole.PROCESSOR)
  @UseGuards(RolesGuardJWT)
  @Post('createBatch')
  @ApiBody({ type: CreateBatchDTO })
  @ApiOperation({ summary: 'Creates a batch from harvested tea' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBatch(
    @Body() createBatchDTO: CreateBatchDTO,
    @Req() request: Request,
  ) {
    const user = request.cookies?.user;
    return this.processorService.createBatch(createBatchDTO, user);
  }

  @Roles(UserRole.PROCESSOR)
  @UseGuards(RolesGuardJWT)
  @Post('updateTealeavesStatus')
  @ApiBody({ type: [UpdateTealeavesStatusDTO] })
  @ApiOperation({
    summary: 'Updates the status of tea leaves during processing',
  })
  @ApiResponse({ status: 200, description: 'Success response' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateTealeavesStatus(
    @Body(new ParseArrayPipe({ items: UpdateTealeavesStatusDTO }),ValidationPipe) updateTealeavesStatusDTO: UpdateTealeavesStatusDTO[],
    @Req() request: Request,
  ) {
    const user = request.cookies?.user;
    return this.processorService.updateTealeavesStatus(
      updateTealeavesStatusDTO,
      user
    );
  }

  @Roles(UserRole.PROCESSOR)
  @UseGuards(RolesGuardJWT)
  @Get('getBatchDetails')
  @ApiOperation({ summary: 'Retrieves batch details' })
  @ApiResponse({
    status: 200,
    description: 'Batch details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  @ApiQuery({
    name: 'batchId',
    description: 'The unique identifier for the batch.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'isBlockchain',
    required: false, // Make this query parameter optional
    description:
      'Flag to specify if the data should be fetched from the blockchain.',
    example: 'true',
  })
  async getBatchDetails(
    @Query('batchId', ParseUUIDPipe) batchId: string,
    @Req() request: Request,
    @Query('isBlockchain',ParseBoolPipe) isBlockchain?: boolean, // Mark this parameter as optional
  ) {
    return this.processorService.getBatchDetails(
      batchId,
      request,
      isBlockchain,
    );
  }

  @Roles(UserRole.PROCESSOR)
  @UseGuards(RolesGuardJWT)
  @Get('getAllHarvestDetails')
  @ApiOperation({ summary: 'Fetch allharvest' })
  @ApiResponse({
    status: 200,
    description: 'Harvest details fetched successfully',
    type: [HarvestModel],
  })
  async getHarvestAllDetails(): Promise<HarvestModel[]> {
    return this.farmerService.getHarvestAllDetails();
  }
}
