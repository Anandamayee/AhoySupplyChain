import {
  Controller,
  Get,
  Logger,
  ParseBoolPipe,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConsumerService } from '../service/consumer.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NoAuth } from '@app/user-guard';

@Controller('consumer')
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name)
  constructor(private readonly consumerService: ConsumerService) {}

  @Get()
  @NoAuth()
  @ApiOperation({ summary: 'QR Code with batch details' })
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
  async fetchTealifecycle(
    @Query('batchId', ParseUUIDPipe) batchId: string,
    @Res() res: Response,
    @Query('isBlockchain', ParseBoolPipe) isBlockchain?: boolean, // Mark this parameter as optional
  ): Promise<void> {
    try {
      const filePath = await this.consumerService.fetchTealifecycle(
        batchId,
        isBlockchain,
      );

      // Send the file as a download response
      res.download(filePath, (err) => {
        if (err) {
          this.logger.error('Error downloading file:', err);
          res.status(500).send({ error: 'Failed to download the file.' });
        } else {
          this.logger.debug('File downloaded successfully.');
        }
      });
    } catch (error) {
      this.logger.error("Exception in fetchTealifecycle() Method", error)
      res.status(500).send({ error: error.message });
    }
  }
}
