import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { KafkaConsumer } from '../kafka/kafka.consumer';
import { HarvestDBProvider } from '@app/db-utilites/dbProviders/harvestDBProvider';
import { FarmerService } from '../service/farmer.service';

@Injectable()
export class FarmerQueueReceiver implements OnModuleInit {
  private readonly logger = new Logger(FarmerQueueReceiver.name);
  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly farmerService: FarmerService,
    @Inject('HARVEST_PROVIDER')
    private readonly harvestDBProvider: HarvestDBProvider,
  ) {}

  /**
   * This onModuleInit method is called once when the module is initialized.
   * it sets up the Kafka consumer to start receiving messages.
   */
  async onModuleInit() {
    this.logger.debug(
      'FarmerQueueReceiver.onModuleInit() - Subscribing to farmer-topic',
    );

    // Receive message from queue.
    this.kafkaConsumer.consume(
      { topics: ['farmer-topic'] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          try {
            this.logger.debug(
              '-----MESSAGE RECEIVED FROM QUEUE (farmer-topic)------',
            );
            //Receive message from kafka queue for a specific topic & Parse message.
            let parsedMessage = JSON.parse(message.value.toString());
            this.logger.debug({
              value: parsedMessage,
              topic: topic.toString(),
              partition: partition.toString(),
            });

            await this.farmerService.processMessage(parsedMessage);
          } catch (error) {
            this.logger.error('Error processing message:', error);
          }
        },
      },
      'farmer-group', // Unique group ID for FarmerQueueReceiver
    );
  }
}
