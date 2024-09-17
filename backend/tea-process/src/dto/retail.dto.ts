/* eslint-disable prettier/prettier */
import { RetailerStatus } from '@app/db-utilites/Enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class SetRetailStatusDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string; //Mandatory

  @ApiProperty({
    description: 'Status',
    example: 'Retailer',
    enum: RetailerStatus,
    required: true,
  })
  @IsEnum(RetailerStatus, { message: 'Invalid status' })
  @IsNotEmpty({ message: 'status is required' })
  status: RetailerStatus; //Mandatory

  @ApiProperty({ description: 'Date of the harvest', example: '2024-08-09' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  date: Date;
}
