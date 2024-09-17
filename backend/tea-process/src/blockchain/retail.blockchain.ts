import { SOLIDITY_METHODS } from '@app/db-utilites/Enums/enums';
import { BlockchainHelper } from '@app/eth-utilites';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RetailBlockchainService {
  private readonly logger = new Logger(RetailBlockchainService.name);

  constructor(
    @Inject('BESU_HELPER') private readonly blockchainHelper: BlockchainHelper,
    private configService: ConfigService,
  ) {}

  /**
   * This method updates the retail status on blockchain.
   * @param batchId
   * @param status
   * @returns transactionReceipt
   */
  async setRetailStatus(
    batchId: string, 
    GSTNumber: string
  ): Promise<any> {
    try {
      this.logger.debug(
        'Method RetailBlockchainService.setRetailStatus() Invoked',batchId, GSTNumber
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let transactionHash = '';

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `RetailBlockchainService.setRetailStatus blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          const result = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.teaPlacedInShelvesByRetailer,
            GSTNumber,
            batchId
          );

          transactionHash = result?.transactionHash;
          this.logger.debug(
            `RetailBlockchainService.setRetailStatus transaction successful with hash: ${transactionHash}`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `RetailBlockchainService.setRetailStatus blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error(
              'RetailBlockchainService.setRetailStatus Max retries reached, throwing an exception',
            );
            throw new BadRequestException(
              'Failed to RetailBlockchainService.setRetailStatus() blockchain after multiple attempts.',
            );
          }
        }
      }

      return transactionHash;
    } catch (error) {
      this.logger.error(
        'Exception in RetailBlockchainService.setRetailStatus()',
        error,
      );
      throw error;
    }
  }
}
