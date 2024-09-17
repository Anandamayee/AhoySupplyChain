import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class KafkaConsumer implements OnApplicationShutdown {
  private readonly logger = new Logger(KafkaConsumer.name)
  constructor(private readonly configService: ConfigService) {}

  private readonly kafka = new Kafka({
    // brokers: ['localhost:9092'], // LOCAL
    brokers: ['kafka:9092'],
  });

  // private readonly kafka = new Kafka({
  //   brokers: this.configService.get('KAFKA_BROKER'),
  // });

  private readonly consumers: Consumer[] = [];

  async consume(
    topic: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
    groupId: string,
  ) {
    try {
      this.logger.debug(`Connecting to Kafka consumer with groupId: ${groupId}`);
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      this.logger.debug(`Consumer connected: ${groupId}`);

      await consumer.subscribe(topic);
      this.logger.debug(
        `Subscribed to topic: ${topic.topics} with groupId: ${groupId}`,
      );

      await consumer.run(config);
      this.logger.debug(`Consumer running: ${groupId}`);

      this.consumers.push(consumer);
    } catch (error) {
      this.logger.error(`Error in Kafka consumer with groupId: ${groupId}`, error);
      throw error;
    }
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
