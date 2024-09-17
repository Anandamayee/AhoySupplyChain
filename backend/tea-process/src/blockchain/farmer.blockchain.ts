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
export class FarmerBlockchainService {
  private readonly logger = new Logger(FarmerBlockchainService.name);

  constructor(
    @Inject('BESU_HELPER') private readonly blockchainHelper: BlockchainHelper,
    private configService: ConfigService,
  ) {}

  /**
   * Send the received data to Hyperledger Besu via a smart contract interaction.
   * @param harvestData The data received from the Kafka queue.
   * @returns A promise that resolves with the transaction receipt.
   */
  async createHarvest(createHarvest: any): Promise<string> {
    try {
      this.logger.debug(
        'Method FarmerBlockchainService.createHarvest() Invoked',
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let transactionHash = '';

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `createHarvest blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          const result = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.harvestByFarmer,
            createHarvest.GSTNumber,
            createHarvest.harvestId,
            createHarvest.GSTNumber,
            createHarvest.firmName,
            createHarvest.location,
            createHarvest.harvestDate,
            createHarvest.teaType,
            createHarvest.quantity,
            createHarvest.quality,
          );

          transactionHash = result?.transactionHash;
          this.logger.debug(
            `createHarvest transaction successful with hash: ${transactionHash}`,
          );
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `createHarvest blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error('Max retries reached, throwing an exception');
            throw new BadRequestException(
              'Failed to create harvest in blockchain after multiple attempts.',
            );
          }
        }
      }

      return transactionHash;
    } catch (error) {
      this.logger.error(
        'Exception in FarmerBlockchainService.createHarvest()',
        error,
      );
      throw error;
    }
  }

  async getHarvestDetails(harvestId: string, GSTNumber: string): Promise<any> {
    try {
      this.logger.debug(
        'Method FarmerBlockchainService.getHarvestDetails() Invoked',
      );
      const maxRetries: number = this.configService.get('BLOCKCHAIN_RETRIES');
      let attempt = 0;
      let transactionSuccess = false;
      let harvestDetails = {};

      while (attempt < maxRetries && !transactionSuccess) {
        try {
          attempt++;
          this.logger.debug(
            `getHarvestDetail blockchain transaction attempt: ${attempt}`,
          );

          // Simulate the blockchain transaction
          harvestDetails = await this.blockchainHelper.sendTransaction(
            SOLIDITY_METHODS.getHarvestDetail,
            GSTNumber,
            harvestId,
          );

          this.logger.debug(`getHarvestDetail transaction successful`, harvestDetails);
          transactionSuccess = true;
        } catch (blockchainError) {
          this.logger.error(
            `getHarvestDetail blockchain transaction failed on attempt ${attempt}`,
            blockchainError,
          );

          if (attempt >= maxRetries) {
            this.logger.error('Max retries reached, throwing an exception');
            throw new BadRequestException(
              'Failed to fetch harvest details from blockchain after multiple attempts.',
            );
          }
        }
      }

      return harvestDetails;
    } catch (error) {
      this.logger.error(
        'Exception in FarmerBlockchainService.createHarvest()',
        error,
      );
      throw error;
    }
  }
}
