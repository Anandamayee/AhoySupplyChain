/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

class HarvestStatusModel {
  @ApiProperty({ example: 'harvested', description: 'Status of the harvest' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Date of the status', example: '2023-03-01' })
  @IsDateString()
  date: Date;
}

export class HarvestModel {
  @ApiProperty({
    example: '123456',
    description: 'Unique identifier for the harvest',
  })
  @IsString()
  @IsNotEmpty()
  harvestId: string;

  @ApiProperty({ example: 1000, description: 'Quantity harvested' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'High', description: 'Quality of the harvest' })
  @IsString()
  quality: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date of the harvest' })
  @IsDateString()
  harvestDate: Date;

  @ApiProperty({
    description: 'Tea Type Note : only ApsaraTea Type is allowed ',
    default: 'ApsaraTea',
    example: 'ApsaraTea ',
  })
  @IsString()
  teaType: string = 'ApsaraTea'; // Default value is set to 'ApsaraTea'

  @ApiProperty({
    example: 'Darjeeling',
    description: 'Location of the harvest',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: '12A34BCD5E6F7G8',
    description: 'GST number of the farmer',
  })
  @IsString()
  GSTNumber: string;

  @ApiProperty({
    type: [HarvestStatusModel],
    description: 'Array of harvest statuses',
  })
  @IsArray()
  @IsOptional() // Make it optional as status updates can be added later
  harvestStatus?: HarvestStatusModel[];

  @IsOptional()
  harvestByFarmerTxHash
}
