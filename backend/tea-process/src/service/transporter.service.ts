/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  CreateShippingDTO,
  CreateStorageDTO,
  UpdateShippingStatusDTO,
  UpdateStorageDTO,
} from '../dto/transporter.dto';
import { TransporterBlockchainService } from '../blockchain/transporter.blockchain';
import { BatchDBProvider } from '@app/db-utilites/dbProviders/batchDBProvider';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BatchSchema } from '@app/db-utilites/Model/BatchModel/batchSchema';
import { TransportStatus } from '@app/db-utilites/Enums/enums';
import { Request } from 'express';

@Injectable()
export class TransporterService {
  private readonly logger = new Logger(TransporterService.name);
  constructor(
    private readonly transporterBlockchainService: TransporterBlockchainService,
    @Inject('BATCH_PROVIDER')
    private readonly batchDBProvider: BatchDBProvider,
    @InjectModel('Batch')
    private processorBatchModel: Model<typeof BatchSchema>,
  ) {}

  /**
   * Adds storage details to each batch and updates the batch status.
   * @param storageData - Array of CreateStorageDTO objects containing batchId, humidity, temperature, and date.
   * @returns An object containing the results of the storage updates.
   */
  async createStorage(
    storageData: CreateStorageDTO[],
    request: Request
  ): Promise<{ success: boolean; message: string; failedBatches?: any[] }> {
    const failedBatches = [];
    if (!Array.isArray(storageData) || storageData.length === 0) {
      throw new BadRequestException(
        'Request body should be a non-empty array of CreateStorageDTO objects',
      );
    }

    const user = JSON.parse(request.cookies?.user);
    const GSTNumber = user?.GSTNumber;

    for (const storage of storageData) {
      try {
        this.logger.debug(
          `TransporterService.createStorage() for batchId: ${storage.batchId}`,GSTNumber
        );

        // Update the batch by batchId
        const updateResult = await this.processorBatchModel.findOneAndUpdate(
          { batchId: storage.batchId },
          {
            $set: {
              StorageDetails: [
                {
                  humidity: storage.humidity,
                  temperature: storage.temperature,
                  date: storage.date,
                },
              ],
              gstNumberOfTransporter: GSTNumber
            },
            $push: {
              batchStatus: {
                status: TransportStatus.STORAGE,
                date: storage.date,
              }              
            },
          },
          { new: true, upsert: false },
        );

        if (!updateResult) {
          this.logger.error(`Batch with ID ${storage.batchId} not found`);
          throw new Error(`Batch with ID ${storage.batchId} not found`);
        }

        this.logger.debug(
          `Batch ID ${storage.batchId} storage details updated successfully.`,
        );
      } catch (error) {
        this.logger.error(
          `Error updating storage details for batchId: ${storage.batchId}`,
          error,
        );
        failedBatches.push({ batchId: storage.batchId, error: error.message });
      }
    }

    if (failedBatches.length > 0) {
      this.logger.error(
        `Some storage updates failed: ${JSON.stringify(failedBatches)}`,
      );
      return {
        success: false,
        message: `Some storage updates failed.`,
        failedBatches,
      };
    }

    return {
      success: true,
      message: `All storage updates were successful.`,
    };
  }

  /**
   * Adds shipping details to each batch and updates the batch status.
   * @param shippingData - Array of CreateShippingDTO objects containing senderName, receiverName, carrierName, departureDate, arrivalDate, and status.
   * @returns An object containing the results of the shipping updates.
   */
  async createShipping(
    shippingData: CreateShippingDTO[],
  ): Promise<{ success: boolean; message: string; failedBatches?: any[] }> {
    if (!Array.isArray(shippingData) || shippingData.length === 0) {
      throw new BadRequestException(
        'Request body should be a non-empty array of CreateShippingDTO objects',
      );
    }

    const failedBatches = [];

    for (const shipping of shippingData) {
      try {
        this.logger.debug(
          `Updating shipping details for batchId: ${shipping.batchId}`,
        );

        // Update the batch by batchId
        const updateResult = await this.processorBatchModel.findOneAndUpdate(
          { batchId: shipping.batchId },
          {
            $set: {
              ShippingDetails: {
                senderName: shipping.senderName,
                receiverName: shipping.receiverName,
                carrierName: shipping.carrierName,
                departureDate: shipping.departureDate,
                arrivalDate: shipping.arrivalDate,
              },
            },
            $push: {
              batchStatus: {
                status: shipping.status,
                date:
                  shipping.status === TransportStatus.INSTRANSIT
                    ? new Date(shipping.departureDate)
                    : undefined,
                endDate:
                  shipping.status === TransportStatus.DELIVERED
                    ? new Date(shipping.arrivalDate)
                    : undefined,
              },
            },
          },
          { new: true, upsert: false },
        );

        if (!updateResult) {
          this.logger.error(`Batch with ID ${shipping.batchId} not found`);
          throw new Error(`Batch with ID ${shipping.batchId} not found`);
        }

        this.logger.debug(
          `Batch ID ${shipping.batchId} shipping details updated successfully.`,
        );
      } catch (error) {
        this.logger.error(
          `Error updating shipping details for batchId: ${shipping.batchId}`,
          error,
        );
        failedBatches.push({ batchId: shipping.batchId, error: error.message });
      }
    }

    if (failedBatches.length > 0) {
      this.logger.error(
        `Some shipping updates failed: ${JSON.stringify(failedBatches)}`,
      );
      return {
        success: false,
        message: `Some shipping updates failed.`,
        failedBatches,
      };
    }

    return {
      success: true,
      message: `All shipping updates were successful.`,
    };
  }

  /**
   * Method to update the shipping status of a batch
   * @param updateShippingDTO
   * @returns Promise<{ success: boolean; message: string; }>
   */
  async updateShippingStatus(
    updateShippingDTOs: UpdateShippingStatusDTO[],
    request: Request,
  ): Promise<{ success: boolean; message: string; failedUpdates?: any[] }> {
    const failedUpdates = [];
    const user = JSON.parse(request.cookies?.user);
    const GSTNumber = user?.GSTNumber;

    for (const updateShippingDTO of updateShippingDTOs) {
      try {
        this.logger.debug(
          `Updating shipping status for batchId: ${updateShippingDTO.batchId}`,
        );

        // Step 1: Retrieve and validate the batch
        const batch = await this.getBatch(updateShippingDTO.batchId);
        this.validateShippingStatusUpdate(batch, updateShippingDTO);

        // Step 2: Prepare data for blockchain transaction
        const { harvestIds, storageDetails } = batch;
        const shippingDetails = {
          status: updateShippingDTO.status,
          date: new Date(),
        };

        // Step 3: Send data to blockchain
        // Send data to blockchain
        this.logger.debug('-----Sending data to blockchain-----');
        // const transactionHash = await this.transporterBlockchainService.updateShippingStatus(
        //   GSTNumber,
        //   batch.batchId,
        //   harvestIds,
        //   storageDetails,
        //   shippingDetails,
        // );
        // this.logger.debug('-----Data successfully sent to blockchain-----', transactionHash);


        // Step 4: Update MongoDB after successful blockchain transaction
        await this.updateBatchStatus(batch.batchId, updateShippingDTO.status);

        this.logger.debug(
          `Batch ID ${updateShippingDTO.batchId} shipping status updated successfully.`,
        );
      } catch (error) {
        this.logger.error(
          `Error updating shipping status for batchId: ${updateShippingDTO.batchId}`,
          error,
        );
        failedUpdates.push({
          batchId: updateShippingDTO.batchId,
          error: error.message,
        });
      }
    }

    return this.generateUpdateResponse(failedUpdates);
  }

  /**
   * Retrieves shipping details based on the batchId.
   * @param batchId - The ID of the batch to retrieve shipping details for.
   */
  async getShippingDetail(
    batchId: string,
    request: Request,
    isBlockchain: boolean = false,
  ) {
    try {
      this.logger.debug(
        'Method TransporterService.getShippingDetail() Invoked',
        batchId,
      );
      const user = JSON.parse(request.cookies?.user);
      const GSTNumber = user?.GSTNumber;

      if (isBlockchain === true) {
        this.logger.debug('Fetch from blockchain');
        return await this.transporterBlockchainService.getBatchDetails(
          batchId,
          GSTNumber,
        );
      } else {
        this.logger.debug('Fetch from MongoDB');
        return await this.batchDBProvider.getBatchDetails(batchId);
      }
    } catch (error) {
      console.error(
        'Exception in TransporterSErvice.getShippingDetail()',
        error,
      );
      throw new Error('Exception in TransporterService.getShippingDetail()');
    }
  }

  // ------------HELPER METHODS-------------------//

  private async getBatch(batchId: string): Promise<any> {
    const batch = await this.processorBatchModel.findOne({ batchId });

    if (!batch) {
      this.logger.error(`Batch with ID ${batchId} not found`);
      throw new Error(`Batch with ID ${batchId} not found`);
    }

    return batch;
  }

  private validateShippingStatusUpdate(
    batch: any,
    updateShippingDTO: UpdateShippingStatusDTO,
  ): void {
    const hasInTransit = batch.batchStatus.some(
      (status: any) => status.status === TransportStatus.INSTRANSIT,
    );
    const hasDelivered = batch.batchStatus.some(
      (status: any) => status.status === TransportStatus.DELIVERED,
    );

    if (updateShippingDTO.status === TransportStatus.DELIVERED) {
      if (!hasInTransit || hasDelivered) {
        const errorMessage = hasDelivered
          ? `Cannot update status to delivered. The batch is already delivered.`
          : `Cannot update status to delivered. The batch is not in transit.`;
        this.logger.error(errorMessage);
        throw new BadRequestException(errorMessage);
      }
    }
  }

  private async updateBatchStatus(
    batchId: string,
    status: TransportStatus,
    txnHash?: string,
  ): Promise<void> {
    const date = new Date();
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    const updateResult = await this.processorBatchModel.findOneAndUpdate(
      { batchId },
      {
        $set: {
          teaTokenTrackingByTransporterTxHash: txnHash
        },
        $push: {
          batchStatus: {
            status,
            date,
          },
        },
      },
      { new: true, upsert: false },
    );

    if (!updateResult) {
      this.logger.error(`Batch with ID ${batchId} not found`);
      throw new Error(`Batch with ID ${batchId} not found`);
    }
  }

  private generateUpdateResponse(failedUpdates: any[]): {
    success: boolean;
    message: string;
    failedUpdates?: any[];
  } {
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
}
