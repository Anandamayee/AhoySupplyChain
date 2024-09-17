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
export class ProcessorBlockchainService {
  private readonly logger = new Logger(ProcessorBlockchainService.name);

  constructor(
    @Inject('BESU_HELPER') private readonly blockchainHelper: BlockchainHelper,
    private configService: ConfigService,
  ) {}

  /**
   * Calls the batchingHarvestByProcessor Solidity method on the blockchain.
   * @param harvestIds - An array of harvest IDs.
   * @param quantity - The quantity of the batch.
   * @param quality - The quality of the batch.
   * @param batchId - The batch ID.
   * @param processorGSTNumber - The GST number of the processor.
   * @returns - The results from the Solidity function.
   */
  async updateBatchStatus(
    harvestIds: string[],
    quantity: number,
    quality: string,
    batchId: string,
    processorGSTNumber: string,
  ): Promise<any> {
    try {
      this.logger.debug(
        'Method ProcessorBlockchainService.updateBatchStatus() Invoked',
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let transactionHash = '';

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `ProcessorBlockchainService.batchData blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          const result = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.batchingHarvestByProcessor,
            processorGSTNumber,
            harvestIds,
            quantity,
            quality,
            batchId,
            processorGSTNumber,
          );

          transactionHash = result?.transactionHash;
          this.logger.debug(
            `ProcessorBlockchainService.batchData transaction successful with hash: ${transactionHash}`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `ProcessorBlockchainService.batchData blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error(
              'ProcessorBlockchainService.updateBatchStatus Max retries reached, throwing an exception',
            );
            throw new BadRequestException(
              'Failed to update batch status in  blockchain after multiple attempts.',
            );
          }
        }
      }

      return transactionHash;
    } catch (error) {
      this.logger.error(
        'Exception in ProcessorBlockchainService.updateBatchStatus()',
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
        'Method ProcessorBlockchainService.getBatchDetails() Invoked',batchId,GSTNumber
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let batchDetails = {};

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `ProcessorBlockchainService.getBatchDetails(): blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          batchDetails = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.getBatchDetails,
            GSTNumber,
            batchId,
          );

          this.logger.debug(`ProcessorBlockchainService.getBatchDetails() transaction successful`);
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `ProcessorBlockchainService.getBatchDetails() blockchain transaction failed on attempt ${attempt}`,
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
        'Exception in ProcessorBlockchainService.getBatchDetails()',
        error,
      );
      throw error;
    }
  }
}
