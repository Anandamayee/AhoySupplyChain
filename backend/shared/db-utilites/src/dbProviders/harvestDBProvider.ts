import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HarvestSchema } from '../Model/HarvestModel/harvestSchema';
import { HarvestModel } from '../Model/HarvestModel/HarvestModel';
import { HarvestStatus } from '../Enums/enums';

@Injectable()
export class HarvestDBProvider {
  private readonly logger = new Logger(HarvestDBProvider.name);

  constructor(
    @InjectModel('Harvest') private harvestModel: Model<typeof HarvestSchema>,
  ) {}

  /**
   * Adds a new harvest details to the database.
   * @param harvest - The data transfer object containing harvest data.
   * @returns The saved harvest details.
   */
  public async addHarvestDetails(harvest: HarvestModel,transactionHash :string): Promise<HarvestModel> {
    try {
      // Check if the harvest with the same GSTNumber already exists
      const existingHarvest = await this.harvestModel
        .findOne({ harvestId: harvest.harvestId })
        .exec();
      if (existingHarvest) {
        throw new BadRequestException(
          `HarvestId : ${harvest.harvestId} already exists`,
        );
      }
      // Create a new harvest entry
      const newHarvest = {
        ...harvest,
        harvestStatus: [
          {
            status: HarvestStatus.HARVESTED,
            date: new Date(),
          },
        ],
        harvestByFarmerTxHash:transactionHash
      };
      this.logger.log('Adding new harvest', newHarvest);
      const harvestDetails = new this.harvestModel(newHarvest).save();
      // Save the harvest entry to MongoDB
      return harvestDetails['_doc'];
    } catch (error) {
      this.logger.error('Failed to add new harvest entry', error);
      throw error;
    }
  }

  /**
   * Fetches the harvest details based on the provided harvestId.
   * @param harvestId - The unique identifier of the harvest.
   * @returns The harvest details if found, or throws a NotFoundException.
   */
  public async getHarvestDetails(harvestId: string): Promise<HarvestModel> {
    if (!this.isValidHarvestId(harvestId)) {
      this.logger.warn(`Invalid harvestId format: ${harvestId}`);
      throw new Error('Invalid harvestId format');
    }

    try {
      this.logger.log(`Fetching harvest details for harvestId: ${harvestId}`);
      const harvestDetails = await this.harvestModel
        .findOne({ harvestId :harvestId})
        .exec();

      if (!harvestDetails) {
        throw new NotFoundException(`Harvest with ID ${harvestId} not found`);
      }
      return harvestDetails['_doc'];
    } catch (error) {
      this.logger.error('Failed to fetch harvest details', error);
      throw error;
    }
  }

  /**
   * Fetches the harvest details based on the provided harvestIds.
   * @param harvestIds - The unique identifier of the harvest.
   * @returns The harvest details if found, or throws a NotFoundException.
   */
  public async findAllHarvestDetailsByIds(harvestIds?: string[]): Promise<any> {
    try {
      // Build the aggregation pipeline
      const pipeline: any[] = [
        { $project: { harvestId: 1, quantity: 1, quality: 1 } },
      ];

      // If harvestIds are provided, add a match stage to the pipeline
      if (harvestIds && harvestIds.length > 0) {
        pipeline.unshift({ $match: { harvestId: { $in: harvestIds } } });
      }

      // Perform the aggregation query
      const harvestDetails = await this.harvestModel.aggregate(pipeline);

      return harvestDetails;
    } catch (error) {
      this.logger.error('Failed to fetch harvest Ids', error);
      throw error;
    }
  }

  /**
   * Fetches the harvest details based on the provided harvestIds.
   * @param harvestIds - The unique identifier of the harvest.
   * @returns The harvest details if found, or throws a NotFoundException.
   */
  public async findAllHarvestDetails(): Promise<any> {
    try {
      // Build the aggregation pipeline
      const pipeline: any[] = [
        { $project: { harvestId: 1, quantity: 1, quality: 1 } },
      ];

      // Perform the aggregation query
      const harvestDetails = await this.harvestModel.aggregate(pipeline);

      return harvestDetails;
    } catch (error) {
      this.logger.error('Failed to fetch harvest Ids', error);
      throw error;
    }
  }

  private isValidHarvestId(harvestId: string): boolean {
    // Implement your validation logic here
    return typeof harvestId === 'string' && harvestId.trim() !== '';
  }
}
