/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Put,
  ParseUUIDPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { TransporterService } from '../service/transporter.service';
import {
  CreateShippingDTO,
  CreateStorageDTO,
  UpdateShippingStatusDTO,
} from '../dto/transporter.dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles, RolesGuardJWT } from '@app/user-guard';
import { UserRole } from '@app/db-utilites';
import { Request } from 'express';

@ApiTags('Transporter')
@Controller('transporter')
export class TransporterController {
  constructor(private readonly transporterService: TransporterService) {}

  @Roles(UserRole.TRANSPORTER)
  @UseGuards(RolesGuardJWT)
  @Post('createStorage')
  @ApiBody({ type: [CreateStorageDTO] })
  @ApiOperation({ summary: 'Updates the storage details of a batch' })
  @ApiResponse({
    status: 200,
    description: 'Storage details updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createStorage(
    @Body(new ParseArrayPipe({ items: CreateStorageDTO }), ValidationPipe)
    createStorageDTO: CreateStorageDTO[],
    @Req() request: Request,
  ) {
    return this.transporterService.createStorage(createStorageDTO, request);
  }

  @Roles(UserRole.TRANSPORTER)
  @UseGuards(RolesGuardJWT)
  @Post('createShipping')
  @ApiBody({ type: [CreateShippingDTO] })
  @ApiOperation({ summary: 'Creates shipping details for a batch' })
  @ApiResponse({
    status: 201,
    description: 'Shipping details created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createShipping(
    @Body(new ParseArrayPipe({ items: CreateShippingDTO }), ValidationPipe)
    createShippingDTO: CreateShippingDTO[],
  ) {
    return this.transporterService.createShipping(createShippingDTO);
  }

  @Roles(UserRole.TRANSPORTER)
  @UseGuards(RolesGuardJWT)
  @Put('updateShippingStatus')
  @ApiBody({ type: [UpdateShippingStatusDTO] })
  @ApiOperation({ summary: 'Updates the shipping details of a batch' })
  @ApiResponse({
    status: 200,
    description: 'Shipping details updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateShippingStatus(
    @Body(
      new ParseArrayPipe({ items: UpdateShippingStatusDTO }),
      ValidationPipe,
    )
    updateShippingStatusDTO: UpdateShippingStatusDTO[],
    @Req() request: Request,
  ) {
    return this.transporterService.updateShippingStatus(
      updateShippingStatusDTO,
      request,
    );
  }

  @Roles(UserRole.TRANSPORTER)
  @UseGuards(RolesGuardJWT)
  @Get('getShippingDetail')
  @ApiOperation({ summary: 'Retrieves shipping details for a batch' })
  @ApiResponse({
    status: 200,
    description: 'Shipping details retrieved successfully',
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
  async getShippingDetail(
    @Query('batchId', ParseUUIDPipe) batchId: string,
    @Req() request: Request,
    @Query('isBlockchain', ParseBoolPipe) isBlockchain?: boolean, // Mark this parameter as optional
  ) {
    return this.transporterService.getShippingDetail(batchId, request, isBlockchain);
  }
}
