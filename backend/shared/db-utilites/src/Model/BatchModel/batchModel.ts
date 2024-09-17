import { ApiProperty } from '@nestjs/swagger';

export class BatchModel {
  @ApiProperty({ description: 'Batch ID', example: 'batchId' })
  batchId: string;

  @ApiProperty({ description: 'Quality of the batch', example: 'standard' })
  quality: string;

  @ApiProperty({ description: 'Total quantity in the batch', example: 1000 })
  totalQuantity: number;

  @ApiProperty({
    description: 'List of Harvest IDs in the batch',
    example: ['harvestId1', 'harvestId2'],
  })
  harvestIds: string[];
}
