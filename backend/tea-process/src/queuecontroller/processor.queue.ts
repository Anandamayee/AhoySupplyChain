import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumer } from '../kafka/kafka.consumer';
import { ProcessorService } from '../service/processor.service';

@Injectable()
export class ProcessorQueueReceiver implements OnModuleInit {
  private readonly logger = new Logger(ProcessorQueueReceiver.name);
  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly processorService: ProcessorService,
  ) {}

  /**
   * This onModuleInit method is called once when the module is initialized.
   * it sets up the Kafka consumer to start receiving messages.
   */
  async onModuleInit() {
    this.logger.debug(
      'ProcessorQueueReceiver.onModuleInit() - Subscribing to processor-topic',
    );

    // Receive message from queue.
    this.kafkaConsumer.consume(
      { topics: ['processor-topic'] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          try {
            this.logger.debug(
              '-----MESSAGE RECEIVED FROM QUEUE (processor-topic)------',
            );
            // Parse message
            const parsedMessage = JSON.parse(message.value.toString());
            this.logger.debug({
              value: parsedMessage,
              topic: topic.toString(),
              partition: partition.toString(),
            });

            await this.processorService.processMessage(parsedMessage);
          } catch (error) {
            this.logger.error('Error processing message:', error);
          }
        },
      },
      'processor-group', // Unique group ID for ProcessorQueueReceiver
    );
  }
}
