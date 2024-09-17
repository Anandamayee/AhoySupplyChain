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
export class ConsumerBlockchainService {
  private readonly logger = new Logger(ConsumerBlockchainService.name);

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
  async fetchTeaHistory(GSTNumber: string, batchId: string): Promise<any> {
    try {
      this.logger.debug(
        'Method ConsumerBlockchainService.fetchTeaHistory() Invoked', batchId, GSTNumber
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let transactionHash = '';

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `ConsumerBlockchainService.fetchTeaHistory blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          const result = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.teaTokenTrackingHistory,
            GSTNumber,
            batchId,
          );

          transactionHash = result?.transactionHash;
          this.logger.debug(
            `ConsumerBlockchainService.fetchTeaHistory transaction successful with hash: ${transactionHash}`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `ConsumerBlockchainService.fetchTeaHistory blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error(
              'ConsumerBlockchainService.fetchTeaHistory Max retries reached, throwing an exception',
            );
            throw new BadRequestException(
              'Failed to fetch tea lifecycle details from blockchain after multiple attempts.',
            );
          }
        }
      }

      return transactionHash;
    } catch (error) {
      this.logger.error(
        'Exception in ConsumerBlockchainService.fetchTeaHistory()',
        error,
      );
      throw error;
    }
  }
}
