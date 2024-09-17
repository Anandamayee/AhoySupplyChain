/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RetailBlockchainService } from '../blockchain/retail.blockchain';
import { SetRetailStatusDTO } from '../dto/retail.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BatchSchema } from '@app/db-utilites/Model/BatchModel/batchSchema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { RetailerStatus } from '@app/db-utilites/Enums/enums';

@Injectable()
export class RetailService {
  private readonly logger = new Logger(RetailService.name);
  constructor(
    private readonly retailBlockchainService: RetailBlockchainService,
    @InjectModel('Batch')
    private processorBatchModel: Model<typeof BatchSchema>,
  ) {}

  /**
   * Updates the retail status on the blockchain and stores the event details in MongoDB.
   * @param setRetailStatusDTO - The DTO containing batch ID and status.
   */
  async setRetailStatus(
    setRetailStatusDTO: SetRetailStatusDTO[],
    request: Request,
  ): Promise<{ success: boolean; message: string; failedUpdates?: any[] }> {
    if (!Array.isArray(setRetailStatusDTO) || setRetailStatusDTO.length === 0) {
      throw new BadRequestException(
        'Request body should be a non-empty array of SetRetailStatusDTO objects',
      );
    }

    const failedUpdates = [];
    const user = JSON.parse(request.cookies?.user);
    const GSTNumber = user?.GSTNumber;

    for (const update of setRetailStatusDTO) {
      try {
        this.logger.debug(`Validating batchId: ${update.batchId}`);

        // Validate the batchId, status, and other criteria
        await this.validateBatchForRetailStatusUpdate(
          update.batchId,
          update.status,
        );

        // First, send data to Blockchain
        this.logger.debug(
          `Sending data to blockchain for batchId: ${update.batchId}`,
        );
        const transactionHash =
          await this.retailBlockchainService.setRetailStatus(
            update.batchId,
            GSTNumber,
          );

        if (!transactionHash) {
          this.logger.error(
            `Blockchain operation failed for batchId: ${update.batchId}`,
          );
          failedUpdates.push({
            batchId: update.batchId,
            error: 'Blockchain operation failed',
          });
          continue; // Skip to the next update
        }

        // If blockchain is successful, update MongoDB
        this.logger.debug(`Updating MongoDB for batchId: ${update.batchId}`);
        const updateResult = await this.processorBatchModel.findOneAndUpdate(
          { batchId: update.batchId },
          {
            $set: {
              gstNumberOfRetailer: GSTNumber,
              teaPlacedInShelvesByRetailerTxHash: transactionHash
            },
            $push: {
              batchStatus: {
                status: update.status,
                date: update.date,
              },
            }
          },
          { new: true, upsert: false },
        );

        if (!updateResult) {
          this.logger.error(
            `Batch with ID ${update.batchId} not found in MongoDB`,
          );
          failedUpdates.push({
            batchId: update.batchId,
            error: 'Batch not found in MongoDB',
          });
          continue; // Skip to the next update
        }

        this.logger.debug(
          `Batch ID ${update.batchId} status updated successfully in MongoDB.`,
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
      message: `All updates were successful.`,
    };
  }

  // Helper method for validation
  private async validateBatchForRetailStatusUpdate(
    batchId: string,
    newStatus: string,
  ): Promise<void> {
    // Validate if the batchId exists and if the status is not already 'delivered'
    const batch:any = await this.processorBatchModel.findOne({ batchId: batchId });

    if (!batch) {
      this.logger.error(`Batch with ID ${batchId} not found`);
      throw new Error(`Batch with ID ${batchId} not found`);
    }

    // Check if the status is already 'received'
    const statusAlreadyDelivered = batch?.batchStatus.some(
      (statusEntry: any) => statusEntry.status === RetailerStatus.RECEIVED,
    );

    if (statusAlreadyDelivered) {
      this.logger.error(`Batch with ID ${batchId} has already been received`);
      throw new Error(`Batch with ID ${batchId} has already been received`);
    }
  }
}
