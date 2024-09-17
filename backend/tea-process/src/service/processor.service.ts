/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBatchDTO, UpdateTealeavesStatusDTO } from '../dto/processor.dto';
import { v4 as uuidv4 } from 'uuid';
import { KafkaProducer } from '../kafka/kafka.producer';
import { ProcessorBlockchainService } from '../blockchain/processor.blockchain';
import { HarvestDBProvider } from '@app/db-utilites/dbProviders/harvestDBProvider';
import { BatchDBProvider } from '@app/db-utilites/dbProviders/batchDBProvider';
import { InjectModel } from '@nestjs/mongoose';
import { BatchSchema } from '@app/db-utilites/Model/BatchModel/batchSchema';
import { Model } from 'mongoose';
import { BatchStatus } from '@app/db-utilites/Enums/enums';
import { Request } from 'express';
import { ERROR_MESSAGES } from '@app/exceptions';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);
  constructor(
    private readonly kafkaProducer: KafkaProducer,
    private readonly processorBlockchainService: ProcessorBlockchainService,
    @Inject('HARVEST_PROVIDER')
    private readonly harvestDBProvider: HarvestDBProvider,
    @Inject('BATCH_PROVIDER')
    private readonly processorDBProvider: BatchDBProvider,
    @InjectModel('Batch')
    private processorBatchModel: Model<typeof BatchSchema>,
  ) {}

  /**
   * Creates batches of harvests based on their quality and sends each batch to Kafka.
   * @param harvestIds - An array of harvest IDs to process.
   * @returns Promise<void>
   */
  async createBatch(createBatchDTO: CreateBatchDTO, userDetails: any) {
    this.logger.debug('ProcessorService.createBatch() Invoked');
    try {
      const batchIds: any = [];
      const { harvestIds } = createBatchDTO; // Destructure to get the array of harvestIds

      // Step 1: Fetch all harvest details from MongoDB
      const harvestDetails = await this.fetchHarvestDetails(harvestIds);

      // Step 2: Group harvests by quality
      const groupedByQuality = await this.groupByQuality(harvestDetails);

      // Step 3: Create batches and send each to Kafka
      for (const quality in groupedByQuality) {
        const harvests = groupedByQuality[quality];
        for (let i = 0; i < harvests.length; i += 10) {
          const batch = harvests.slice(i, i + 10); // Create a batch of up to 10 harvests
          const batchId = uuidv4();
          batchIds.push(batchId);
          await this.processBatch(batch, quality, userDetails, batchId);
        }
      }

      // Return a success response with the mapping of UUIDs to data
      return {
        success: true,
        message: 'All messages sent to Kafka Queue.',
        batchIds, // Include data with associated UUIDs
      };
    } catch (error) {
      console.error('Exception in ProcessorService.createBatch()', error);
      throw new Error('Exception in ProcessorService.createBatch().');
    }
  }

  /**
   * Updates the tea leaves status in blokchian and mongoDB for each batchId.
   * @param updates - Array of UpdateTealeavesStatusDTO objects containing batchId, status, and date.
   * @returns Promise<void>
   */
  async updateTealeavesStatus(
    updates: UpdateTealeavesStatusDTO[],
    userDetails: any,
  ): Promise<{ success: boolean; message: string; failedUpdates?: any[] }> {
    this.logger.debug(
      'Method ProcessorService.updateTealeavesStatus() Invoked',
    );
    const failedUpdates = [];

    for (const update of updates) {
      try {
        this.logger.debug(`Validating batchId: ${update.batchId}`);

        // Validate the batch status update
        const { quality, totalQuantity, harvestIds } =
          await this.validateBatchStatusUpdate(update.batchId, update.status);

        // Prepare the message to send to Kafka
        const kafkaMessage = {
          harvestIds: harvestIds,
          quantity: totalQuantity,
          quality: quality,
          batchId: update.batchId,
          processorGSTNumber: JSON.parse(userDetails).GSTNumber,
          status: update.status,
          date: update.date,
          type: 'updateTealeavesStatus',
        };

        // Send the update to Kafka queue
        await this.kafkaProducer.produce('processor-topic', {
          value: JSON.stringify(kafkaMessage),
        });

        this.logger.debug(
          `Message sent to Kafka for batchId: ${update.batchId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error updating status for batchId: ${update.batchId}`,
          error,
        );
        failedUpdates.push({ batchId: update.batchId, error: error.message });
      }
    }

    if (failedUpdates.length > 0) {
      this.logger.error(
        `Some updates failed: ${JSON.stringify(failedUpdates)}`,
      );
      return {
        success: false,
        message: `Some updates failed.`,
        failedUpdates,
      };
    }

    return {
      success: true,
      message: `All updates were successfully sent to Kafka Queue.`,
    };
  }

  /**
   * Retrieves batch details from the blockchain based on the batchId.
   * @param batchId - The batch ID to look up.
   * @returns - The batch details retrieved from the blockchain.
   */
  async getBatchDetails(
    batchId: string,
    request: Request,
    isBlockchain: boolean = false,
  ): Promise<any> {
    this.logger.debug('ProcessorService.getBatchDetails() Invoked');
    try {
      // Fetch from MongoDB and verify who is accessing
      let batchDetails =
        await this.processorDBProvider.getBatchDetails(batchId);
      if (
        JSON.parse(request.cookies?.user)?.GSTNumber !== batchDetails.gstNumberOfProcessor
      ) {
        throw new UnauthorizedException(
          `${ERROR_MESSAGES.UNAUTTHORIZED_ACCESS}`,
        );
      }

      const user = JSON.parse(request.cookies?.user);
      const GSTNumber = user?.GSTNumber;

      if (isBlockchain) {
        this.logger.debug('Fetch from blockchain');
        return await this.processorBlockchainService.getBatchDetails(
          batchId,
          GSTNumber,
        );
      } else {
        this.logger.debug('Fetch from MongoDB');
        return batchDetails;
      }
    } catch (error) {
      console.error(
        'Error in ProcessorService.getBatchDetails service method:',
        error,
      );
      throw error;
    }
  }

  // ---------------------- HELPER METHODS ----------------------//
  /**
   * Fetches harvest details from the MongoDB database for the given harvest IDs.
   * @param harvestIds - An array of harvest IDs to fetch details for.
   * @returns Promise<any[]> - A promise that resolves to an array of harvest details.
   */
  private async fetchHarvestDetails(harvestIds: string[]): Promise<any[]> {
    return Promise.all(
      harvestIds.map((id) => this.harvestDBProvider.getHarvestDetails(id)),
    );
  }

  /**
   * Groups the harvest details by their quality.
   * @param harvestDetails - An array of harvest details to group.
   * @returns Record<string, any[]> - An object where the keys are quality types and the values are arrays of harvest details.
   */
  private groupByQuality(harvestDetails: any[]): Record<string, any[]> {
    return harvestDetails.reduce(
      (groups, harvest) => {
        const quality = harvest.quality;
        if (!groups[quality]) groups[quality] = [];
        groups[quality].push(harvest);
        return groups;
      },
      {} as Record<string, any[]>,
    );
  }

  /**
   * Processes a batch of harvests, generates a batchId, calculates the total quantity, and sends the batch to Kafka.
   * @param batch - An array of harvests to process.
   * @param quality - The quality of the harvests in this batch.
   * @returns Promise<void>
   */
  private async processBatch(
    batch: any[],
    quality: string,
    userDetails: any,
    batchId: string,
  ): Promise<void> {
    const totalQuantity = batch.reduce(
      (sum, harvest) => sum + harvest.quantity,
      0,
    );

    const message = {
      type: 'createBatch',
      gstNumberOfProcessor: JSON.parse(userDetails)?.GSTNumber,
      batchId,
      quality,
      totalQuantity,
      harvestIds: batch.map((harvest) => harvest.harvestId),
    };

    // Send the batch to Kafka
    await this.kafkaProducer.produce('processor-topic', {
      value: JSON.stringify(message),
    });

    this.logger.debug('Batch sent to Kafka:', message);
  }

  /**
   * Helper method to validate if existing batchstatus is valid
   * @param batchId
   * @param newStatus
   * @returns
   */
  private async validateBatchStatusUpdate(
    batchId: string,
    newStatus: string,
  ): Promise<{ quality: string; totalQuantity: number; harvestIds: string[] }> {
    this.logger.debug(`Validating batchId: ${batchId}`);

    // Validate if the batchId exists in the database
    const batch: any = await this.processorBatchModel.findOne({ batchId });

    if (!batch) {
      this.logger.error(`Batch with ID ${batchId} not found`);
      throw new Error(`Batch with ID ${batchId} not found`);
    }

    // Check if the status is already present in batchStatus
    const statusAlreadyUpdated = batch.batchStatus.some(
      (statusEntry: any) => statusEntry.status === newStatus,
    );

    if (statusAlreadyUpdated) {
      this.logger.error(
        `Status '${newStatus}' has already been updated for batchId: ${batchId}`,
      );
      throw new Error(
        `Status '${newStatus}' has already been updated for batchId: ${batchId}`,
      );
    }

    // Return quality and quantity for further processing
    return {
      quality: batch.quality,
      totalQuantity: batch.totalQuantity,
      harvestIds: batch.harvestIds,
    };
  }

  // ---------------------- KAFKA HELPER METHODS ----------------------//
  /**
   * Process the parsed message received from kafka queue and process it in blockchain and db.
   * @param parsedMsg The parsed message received from Kafka Queue.
   */
  async processMessage(parsedMsg: any) {
    this.logger.debug('ProcessorService.processMessage()', parsedMsg);

    try {
      switch (parsedMsg?.type) {
        case 'createBatch':
          await this.handleCreateBatch(parsedMsg);
          break;

        case 'updateTealeavesStatus':
          await this.handleUpdateTealeavesStatus(parsedMsg);
          break;

        default:
          this.logger.error('Unknown message type:', parsedMsg?.type);
          break;
      }
    } catch (error) {
      this.logger.error(
        'Exception in ProcessorService.processMessage()',
        error,
      );
      throw error;
    }
  }

  private async handleCreateBatch(parsedMsg: any) {
    this.logger.debug('Processing createBatch...');

    // Transform data
    parsedMsg['batchStatus'] = [
      { status: BatchStatus.BATCHED, date: Date.now() }, // Adding status for tracking purpose
    ];

    // No blockchain call needed for createBatch

    delete parsedMsg['type']; //remove the type of msg

    // Send data to DB
    this.logger.debug('-----Sending data to DB-----');
    await this.processorDBProvider?.addBatchDetails(parsedMsg);
    this.logger.debug('-----Data successfully sent to DB-----');
  }

  private async handleUpdateTealeavesStatus(parsedMsg: any) {
    this.logger.debug('Processing updateBatch...');

    const { harvestIds, quantity, quality, batchId, processorGSTNumber } =
      parsedMsg;

    // Send data to blockchain
    this.logger.debug('-----Sending data to blockchain-----');
    const transactionHash = await this.processorBlockchainService.updateBatchStatus(
      harvestIds,
      quantity,
      quality,
      batchId,
      processorGSTNumber,
    );
    this.logger.debug('-----Data successfully sent to blockchain-----', transactionHash);

    parsedMsg['batchingHarvestByProcessorTxHash'] = transactionHash;
    delete parsedMsg['type']; //remove the type of msg

    // Update MongoDB with the new status corresponding to batchId
    await this.processorDBProvider.updateBatchStatusInDB(batchId, parsedMsg);
  }
}
