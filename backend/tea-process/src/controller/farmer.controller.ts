import { FarmerService } from '../service/farmer.service';
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  Req,
  ParseBoolPipe,
  ParseUUIDPipe,
  ParseArrayPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CreateHarvestDTO } from '../dto/farmer.dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HarvestModel, UserRole } from '@app/db-utilites';
import { Roles, RolesGuardJWT } from '@app/user-guard';
import { Request } from 'express';

@ApiTags('Farmer')
@Controller('farmer')
export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}

  /**
   * Method To Create Harvest Data
   * @param CreateHarvestDTO
   * @returns
   */
  @Roles(UserRole.FARMER)
  @UseGuards(RolesGuardJWT)
  @Post('createHarvest')
  @ApiBody({ type: [CreateHarvestDTO] })
  @ApiOperation({ summary: 'Create a new harvest entry' })
  @ApiResponse({ status: 201, description: 'Harvest created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createHarvest(
    @Body(new ParseArrayPipe({ items: CreateHarvestDTO }),ValidationPipe)
    createHarvests: CreateHarvestDTO[],
    @Req() request: Request,
  ): Promise<any> {
    return this.farmerService.createHarvest(createHarvests, request);
  }

  /**
   * Method To Get Harvest Details Using HarvestId
   * @param harvestId
   * @returns
   */
  @Roles(UserRole.FARMER)
  @UseGuards(RolesGuardJWT)
  @Get('getHarvestDetails')
  @ApiOperation({ summary: 'Fetch details of a specific harvest' })
  @ApiResponse({
    status: 200,
    description: 'Harvest details fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'HarvestId not found' })
  @ApiQuery({
    name: 'harvestId',
    description: 'The unique identifier for the harvest.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'isBlockchain',
    required: false, // Make this query parameter optional
    description:
      'Flag to specify if the data should be fetched from the blockchain. Note This field is not Enabled For Time being',
    example: 'true',
  })
  async getHarvestDetails(
    @Query('harvestId', ParseUUIDPipe) harvestId: string,
    @Req() request: Request,
    @Query('isBlockchain', ParseBoolPipe) isBlockchain?: boolean,
  ): Promise<HarvestModel> {
    return this.farmerService.getHarvestDetails(
      harvestId,
      request,
      isBlockchain,
    );
  }
}
