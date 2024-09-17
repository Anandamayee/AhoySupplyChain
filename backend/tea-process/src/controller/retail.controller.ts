/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseGuards, ParseArrayPipe, ValidationPipe, Req } from '@nestjs/common';
import { RetailService } from '../service/retail.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetRetailStatusDTO } from '../dto/retail.dto';
import { Roles, RolesGuardJWT } from '@app/user-guard';
import { UserRole } from '@app/db-utilites';
import { Request } from 'express';

@ApiTags('Retailer')
@Controller('retailer')
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Roles(UserRole.RETAILER)
  @UseGuards(RolesGuardJWT)
  @Post('setRetailStatus')
  @ApiBody({ type: [SetRetailStatusDTO] })
  @ApiOperation({ summary: 'Updates the retail status of a batch' })
  @ApiResponse({
    status: 200,
    description: 'Retail status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async setRetailStatus(
    @Body(new ParseArrayPipe({ items: SetRetailStatusDTO }),ValidationPipe) setRetailStatusDTO: SetRetailStatusDTO[],
    @Req() request: Request) {
    return this.retailService.setRetailStatus(setRetailStatusDTO, request);
  }
}
