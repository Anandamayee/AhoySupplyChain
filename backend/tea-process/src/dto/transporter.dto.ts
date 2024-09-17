/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDate,
} from 'class-validator';
import { TransportStatus } from '@app/db-utilites/Enums/enums';
import { Transform } from 'class-transformer';

export class CreateStorageDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string; //Mandatory

  @ApiProperty({
    description: 'Humidity',
    example: '20.29',
  })
  @IsNumber()
  humidity: string; //Mandatory

  @ApiProperty({
    description: 'Temperature',
    example: '30',
  })
  @IsString()
  temperature: string; //Mandatory

  @ApiProperty({ description: 'Date of the Storage', example: '2023-03-01' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  @IsNotEmpty()
  date: Date;//Mandatory
}

export class UpdateStorageDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsString()
  batchId: string; //Mandatory

  @ApiProperty({
    description: 'Humidity',
    example: 'humidity',
  })
  @IsString()
  humidity: string; //Mandatory

  @ApiProperty({
    description: 'Temperature',
    example: 'temperature',
  })
  @IsString()
  temperature: string; //Mandatory

  @ApiProperty({ description: 'Date of the Storage' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  storageDate: Date; //Mandatory
}
export class CreateShippingDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsString()
  batchId: string;

  @ApiProperty({ description: 'Sender Name', example: 'Gangu Bai' })
  @IsString()
  senderName: string;

  @ApiProperty({ description: 'Receiver Name', example: 'Ramu Kaka' })
  @IsString()
  receiverName: string;

  @ApiProperty({
    description: 'Carrier Name',
    example: 'DTDC, DELIVERY, BLUEDART',
  })
  @IsString()
  carrierName: string;

  @ApiProperty({ description: 'Departure date', example: '2023-03-01' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  departureDate: Date;

  @ApiProperty({ description: 'Arrival date', example: '2023-03-05' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  arrivalDate: Date;

  @ApiProperty({
    description: 'Transport Status',
    example: 'Intransit',
    enum: TransportStatus,
    required: true,
  })
  @IsEnum(TransportStatus, { message: 'Invalid status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TransportStatus;
}
export class UpdateShippingStatusDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string; //Mandatory

  @ApiProperty({
    description: 'Status',
    example: 'delivered',
    enum: TransportStatus,
    required: true,
  })
  @IsEnum(TransportStatus, { message: 'Invalid status' })
  @IsNotEmpty({ message: 'status is required' })
  status: TransportStatus; //Mandatory

  @ApiProperty({ description: 'Date of the Storage' })
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  @IsDate({ message: 'Invalid date format. Please use the format YYYY-MM-DD.' })
  date: Date;
}

export class GetShippingDetailDTO {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  @IsUUID('4', {
    message: 'enter harvestId in 123e4567-e89b-12d3-a456-426614174000 format',
  })
  @IsNotEmpty()
  batchId: string;
}
