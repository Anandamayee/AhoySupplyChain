import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateHarvestDTO } from '../dto/farmer.dto';
import { KafkaProducer } from '../kafka/kafka.producer';
import { v4 as uuidv4 } from 'uuid';
import { FarmerBlockchainService } from '../blockchain/farmer.blockchain';
import { HarvestDBProvider } from '@app/db-utilites/dbProviders/harvestDBProvider';
import { UserDBProvider } from '@app/db-utilites/dbProviders/userDBProvider';
import { HarvestModel } from '@app/db-utilites';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '@app/exceptions';

@Injectable()
export class FarmerService {
  private readonly logger = new Logger(FarmerService.name);

  constructor(
    private readonly kafkaProducer: KafkaProducer,
    private readonly farmerBlockchainService: FarmerBlockchainService,
    @Inject('HARVEST_PROVIDER')
    private readonly harvestDBProvider: HarvestDBProvider,
    @Inject('USERDB_PROVIDER') private readonly userDBProvider: UserDBProvider,
    private configService: ConfigService,
  ) {}

  /**
   * Processes an array of harvest data by sending each item to a Kafka topic
   * and returns the data along with unique UUIDs for each item.
   *
   * @param createHarvests - An array of objects containing harvest details. Each object should
   *                           include quantity, quality, date, and other optional fields.
   * @returns An object containing a success flag, a message, and an array of harvest data with UUIDs.
   */
  async createHarvest(
    createHarvests: CreateHarvestDTO[],
    request: Request,
  ): Promise<any> {
    this.logger.debug('FarmerService.createHarvest() Invoked');
    try {
      const user = JSON.parse(request.cookies?.user);
      const GSTNumber = user?.GSTNumber;
      const firmName = user?.firmName;
      
      // Generate a unique ID for each message and create a mapping
      const harvestDataWithIds = createHarvests.map((data) => ({
        ...data,
        GSTNumber,
        firmName,
        harvestId: uuidv4(),
      }));
      const FARMER_TOPIC: string = this.configService.get('FARMER_TOPIC');
      // Send each message to Kafka
      for (const messageData of harvestDataWithIds) {
        const message = { value: JSON.stringify(messageData) };
        await this.kafkaProducer.produce(FARMER_TOPIC, message);
        this.logger.debug(`Message sent to Kafka Queue: ${JSON.stringify(messageData)}`);
      }

      // Return a success response with the mapping of UUIDs to data
      return {
        success: true,
        message:
          'Harvest details are getting updated to Database and Blockchain',
        harvestDataWithIds, // Include data with associated UUIDs
      };
    } catch (error) {
      this.logger.error('Exception in FarmerService.createHarvest()', error);
      throw new Error('Exception in FarmerService.createHarvest().');
    }
  }

  /**
   * Method to get harvest details using harvestId.
   * Fetches data from blockchain or MongoDB based on the isBlockchain flag.
   *
   * @param harvestId - The unique identifier for the harvest.
   * @param isBlockchain - Flag indicating whether to fetch data from blockchain (true) or MongoDB (false).
   * @returns - A promise that resolves to the harvest details from the chosen data source.
   */
  async getHarvestDetails(
    harvestId: string,
    request:Request,
    isBlockchain: boolean = false,
  ): Promise<HarvestModel> {
    this.logger.debug('FarmerService.getHarvestDetails() Invoked');
    try {
      // Fetch from MongoDB and verify who is accessing 
      let harvestDetails = await this.harvestDBProvider.getHarvestDetails(harvestId)
      if (JSON.parse(request.cookies?.user)?.GSTNumber !== harvestDetails.GSTNumber) {
        throw new UnauthorizedException(
          `${ERROR_MESSAGES.UNAUTTHORIZED_ACCESS}`,
        );
      }

      const user = JSON.parse(request.cookies?.user);
      const GSTNumber = user?.GSTNumber;

      if (isBlockchain === true) {
        this.logger.debug('Fetch from blockchain');
        const harvestDetails =
          await this.farmerBlockchainService.getHarvestDetails(harvestId, GSTNumber);
        return harvestDetails;
      } else {
        this.logger.debug('Fetch from MongoDB');
        return harvestDetails;
      }
    } catch (error) {
      this.logger.error('Exception in getHarvestDetails()', error);
      throw error;
    }
  }

  // ------------HELPER METHODS-------------------//
  /**
   * Process the parsed message received from kafka queue and process it in blockchain and db.
   * @param parsedMsg The parsed message received from Kafka Queue.
   */
  async processMessage(parsedMsg: any): Promise<HarvestModel> {
    this.logger.debug('FarmerQueueReceiver.processMessage()', parsedMsg);
    try {
      // STEP 1: Transform data, if reqd
      
      // STEP2:  Send data to blockchain
      this.logger.debug('-----Sending data to blockchain-----', parsedMsg);

      // Send the data to the blockchain
      const blockchainResponse =
        await this.farmerBlockchainService.createHarvest(parsedMsg);
      this.logger.debug('-----Data successfully sent to blockchain-----', blockchainResponse);

      // STEP2: Send data to db
      this.logger.debug('-----Sending data to db-----');
      const harvestDetails =
        await this.harvestDBProvider?.addHarvestDetails(parsedMsg,blockchainResponse);
      this.logger.debug('-----Data successfully sent to db-----');
      return harvestDetails;
    } catch (error) {
      this.logger.error('FarmerQueueReceiver.processMessage()', error);
      throw error;
    }
  }

  public async getHarvestAllDetails(): Promise<HarvestModel[]> {
    try {
      this.logger.debug('FarmerQueueReceiver.getHarvestAllDetails()');
      return await this.harvestDBProvider?.findAllHarvestDetails();
    } catch (error) {
      this.logger.error('Exception in FarmerQueueReceiver.getUser()', error);
      throw new BadRequestException(error);
    }
  }
}
