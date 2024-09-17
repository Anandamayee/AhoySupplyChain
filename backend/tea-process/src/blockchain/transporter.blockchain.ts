/* eslint-disable prettier/prettier */
import { SOLIDITY_METHODS } from '@app/db-utilites/Enums/enums';
import { BlockchainHelper } from '@app/eth-utilites';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransporterBlockchainService {
  private readonly logger = new Logger(TransporterBlockchainService.name);

  constructor(
    @Inject('BESU_HELPER') private readonly blockchainHelper: BlockchainHelper,
    private configService: ConfigService,
  ) {}

  /**
   * Calls the Solidity function to update shipping details on the blockchain.
   * @param storageData - The data for updating storage details.
   */
  async updateShippingStatus(
    GSTNumber: string,
    batchId: string,
    harvestIds: string[],
    storageDetails: any,
    shippingDetails: any,
  ) {
    try {
      this.logger.debug(
        'Method TransporterBlockchainService.updateShippingStatus() Invoked',
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let transactionHash = '';

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `TransporterBlockchainService.updateShippingStatus() blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          const result = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.teaTokenTrackingByTransporter,
            GSTNumber,
            batchId,
            // harvestIds,
            storageDetails,
            shippingDetails,
          );

          transactionHash = result?.transactionHash;
          this.logger.debug(
            `TransporterBlockchainService.updateShippingStatus() transaction successful with hash: ${transactionHash}`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `TransporterBlockchainService.updateShippingStatus() blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error('Max retries reached, throwing an exception');
            throw new BadRequestException(
              'Failed to update shipping status in blockchain after multiple attempts.',
            );
          }
        }
      }

      return transactionHash;
    } catch (error) {
      this.logger.error(
        'Exception in TransporterBlockchainService.updateShippingStatus()',
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves batch details from the blockchain based on the batchId.
   * @param batchId - The batch ID to look up.
   * @returns - The batch details retrieved from the blockchain.
   */
  async getBatchDetails(batchId: string, GSTNumber: string): Promise<any> {
    try {
      this.logger.debug(
        'Method TransporterBlockchainService.getBatchDetails() Invoked',
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let batchDetails = {};

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `TransporterBlockchainService.getBatchDetails(): blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          batchDetails = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.getShippingDetail,
            GSTNumber,
            batchId,
          );

          this.logger.debug(
            `TransporterBlockchainService.getBatchDetails() transaction successful`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `TransporterBlockchainService.getBatchDetails() blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error('Max retries reached, throwing an exception');
            throw new BadRequestException(
              'Failed to fetch batch details from blockchain after multiple attempts.',
            );
          }
        }
      }

      return batchDetails;
    } catch (error) {
      this.logger.error(
        'Exception in TransporterBlockchainService.getBatchDetails()',
        error,
      );
      throw error;
    }
  }
}
