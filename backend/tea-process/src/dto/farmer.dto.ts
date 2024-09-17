import { Quality } from '@app/db-utilites/Enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  Min,
  IsDate,
} from 'class-validator';

export class CreateHarvestDTO {
  @ApiProperty({ description: 'Quantity of the harvest In Kg', example: '100' })
  @Min(1)
  @IsNumber()
  quantity: number; //Mandatory

  @ApiProperty({
    description: 'Quality of the harvest',
    example: 'VIP',
    enum: Quality,
    required: true,
  })
  @IsEnum(Quality, { message: 'Invalid Quality' })
  @IsNotEmpty({ message: 'Quality is required' })
  quality: Quality; //Mandatory

  @ApiProperty({ description: 'Date of the harvest', example: '2024-08-29' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  harvestDate: Date; //Mandatory

  @ApiProperty({
    description: 'Tea Type Note : only ApsaraTea Type is allowed ',
    example: 'ApsaraTea ',
  })
  @IsString({ message: 'Tea Type Note : only ApsaraTea Type is allowed ' })
  @IsOptional()
  teaType: string = 'ApsaraTea'; // Default value is set to 'ApsaraTea'

  @ApiProperty({ description: 'Location', example: 'Gurgaon' })
  @IsNotEmpty({ message: 'Please enter locatoion' })
  @IsString()
  location: string;
}

/**
 * DTO for fetching harvest details.
 */
export class GetHarvestDetailsDTO {
  @ApiProperty({
    description: 'The unique identifier for the harvest.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  harvestId: string;

  @ApiProperty({
    description:
      'Flag indicating whether to fetch data from blockchain (true) or MongoDB (false).',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isBlockchain: boolean;
}
