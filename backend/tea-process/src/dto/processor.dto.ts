/* eslint-disable prettier/prettier */
import { TeaLeavesStatus } from '@app/db-utilites/Enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CreateBatchDTO {
  @ApiProperty({
    description: 'Array of Harvest IDs to be processed into batches',
    example: ['harvestId1', 'harvestId2', 'harvestId3'],
  })
  @IsNotEmpty({ each: true })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
    each: true,
  })
  harvestIds: string[]; // Mandatory
}
export class UpdateTealeavesStatusDTO {
  @ApiProperty({ description: 'Temporary Batch ID', example: 'tempBatchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string; //Mandatory

  @ApiProperty({ description: 'TeaLeaves status', example: 'withering' })
  @ApiProperty({
    description: 'TeaLeaves status',
    example: 'withering',
    enum: TeaLeavesStatus,
    required: true,
  })
  @IsEnum(TeaLeavesStatus, { message: 'Status role' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TeaLeavesStatus; //Mandatory

  //future enhancement for start and end date

  @ApiProperty({ description: 'End dates', example: '2023-03-01' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  date: Date //Mandatory
}

export class GetBatchDetailsDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string;
}
