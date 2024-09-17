import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BatchSchema } from '../Model/BatchModel/batchSchema';
import { BatchModel } from '../Model/BatchModel/batchModel';

@Injectable()
export class BatchDBProvider {
  private readonly logger = new Logger(BatchDBProvider.name);

  constructor(
    @InjectModel('Batch')
    private processorBatchModel: Model<typeof BatchSchema>,
  ) {}

  /**
   * Adds batch details to MongoDB.
   * @param batchDetails - The batch details to add.
   * @returns Promise<any> - The saved batch details.
   */
  public async addBatchDetails(batchDetails: BatchModel): Promise<any> {
    try {
      this.logger.debug('ProcessorDBProvider.addBatchDetails Invoked()');
      // Check if the batch with the same batchId already exists
      const existingBatch = await this.processorBatchModel
        .findOne({ batchId: batchDetails.batchId })
        .exec();

      if (existingBatch) {
        throw new BadRequestException(
          `Batch with ID ${batchDetails.batchId} already exists.`,
        );
      }

      // Create a new batch entry
      const newBatch = new this.processorBatchModel(batchDetails);
      this.logger.log('Adding new batch', newBatch);

      // Save the batch entry to MongoDB
      return await newBatch.save();
    } catch (error) {
      this.logger.error('Failed to add batch details', error);
      throw error;
    }
  }

  /**
   * Fetches the harvest details based on the provided harvestId.
   * @param harvestId - The unique identifier of the harvest.
   * @returns The harvest details if found, or throws a NotFoundException.
   */
  public async getBatchDetails(batchId: string): Promise<any> {
    if (!this.isValidBatchId(batchId)) {
      this.logger.warn(`Invalid batchId format: ${batchId}`);
      throw new Error('Invalid batchId format');
    }
    try {
      this.logger.log(
        `ProcessorDBProvider.getBatchDetails() for batchId: ${batchId}`,
      );
      const batchDetails = await this.processorBatchModel
        .findOne({ batchId: batchId })
        .exec();

      if (!batchDetails) {
        throw new NotFoundException(`Batch with ID ${batchId} not found`);
      }
      return batchDetails['_doc'];
    } catch (error) {
      this.logger.error(
        'Exception in ProcessorDBProvider.getBatchDetails()',
        error,
      );
      throw error;
    }
  }

  private isValidBatchId(batchId: string): boolean {
    // Implement your validation logic here
    return typeof batchId === 'string' && batchId.trim() !== '';
  }

  /**
   * updates the db with batchstatus corresponding to batchId
   * @param batchId 
   * @param updateData 
   */
  public async updateBatchStatusInDB(batchId: string, updateData: any) {
    this.logger.debug(`Updating MongoDB with new status for batchId: ${batchId}`);
  
    const updateResult = await this.processorBatchModel.findOneAndUpdate(
      { batchId: batchId },
      {
        $set:{
          batchingHarvestByProcessorTxHash: updateData.batchingHarvestByProcessorTxHash,
        },
        $push: {
          batchStatus: {
            status: updateData.status,
            date: updateData.date,
          },
        },
      },
      { new: true, upsert: false }, // upsert: false ensures it doesn't create a new entry if not found
    );
  
    if (!updateResult) {
      this.logger.error(`Batch with ID ${batchId} not found in MongoDB`);
      throw new Error(`Batch with ID ${batchId} not found in MongoDB`);
    }
  
    this.logger.debug(`Batch ID ${batchId} status updated successfully in MongoDB.`);
  }
}
