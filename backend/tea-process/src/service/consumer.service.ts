import { Injectable, Inject, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as path from 'path';
import { BatchDBProvider } from '@app/db-utilites/dbProviders/batchDBProvider';
import { ConsumerBlockchainService } from '../blockchain/consumer.blockchain';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    @Inject('BATCH_PROVIDER')
    private readonly batchDBProvider: BatchDBProvider,
    private readonly consumerBlockchainService: ConsumerBlockchainService,
  ) {}

  async fetchTealifecycle(
    batchId: string,
    isBlockchain: boolean = false,
  ): Promise<string> {
    this.logger.debug(
      'method fetchTealifecycle() Invoked for batchId: ',
      batchId,isBlockchain
    );
    try {
      // Fetch the details from batches table for a batchId from MongoDB
      let batchDetails = await this.batchDBProvider.getBatchDetails(batchId);

      if (isBlockchain) {
        this.logger.debug('----Fetch from blockchain----');
        batchDetails = await this.consumerBlockchainService.fetchTeaHistory(
          batchDetails.gstNumberOfRetailer,
          batchId,
        );
      }

      // Structure the data in a more readable format
      const formattedData = {
        BatchID: batchDetails.batchId,
        TotalQuantity: `${batchDetails.totalQuantity} Kg`,
        Quality: batchDetails.quality,
        gstNumberOfProcessor: batchDetails.gstNumberOfProcessor || 'N/A',
        gstNumberOfTransporter: batchDetails.gstNumberOfTransporter || 'N/A',
        gstNumberOfRetailer: batchDetails.gstNumberOfRetailer || 'N/A',
        DepartureDate: batchDetails.createdAt || 'N/A',
        ArrivalDate: batchDetails.updatedAt || 'N/A',
        BatchStatus: batchDetails.batchStatus.map((status: any) => ({
          Status: status.status,
          Date: status.date
            ? new Date(status.date).toLocaleDateString()
            : 'N/A',
        })),
        StorageDetails: batchDetails.StorageDetails || 'N/A',
        ShippingDetails: batchDetails.ShippingDetails || 'N/A',
      };

      // Convert formatted data to string
      const dataStr = JSON.stringify(formattedData, null, 2); // Pretty print with 2-space indentation
      const fileName = `qr_${batchId}.png`;
      const filePath = path.join(__dirname, fileName);

      // Generate QR code with the formatted data
      await QRCode.toFile(filePath, dataStr);

      return filePath;
    } catch (error) {
      this.logger.error('Exception for fetchTealifecycle():', error);
      throw error;
    }
  }
}
