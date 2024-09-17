import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Message, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka: Kafka;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      // clientId: 'tea-supply-chain',
      // brokers: ['localhost:9092'], // Replace with your Kafka broker
      brokers: ['kafka:9092'],
    });
  }
  private producer: Producer;

  /**
   * This Method initializes the Kafka producer when the module is initialized.
   * This method is automatically called when the service is instantiated.
   */
  async onModuleInit() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  /**
   * Sends a message to a specified Kafka topic.
   *
   * @param topic - The Kafka topic to which the messages should be sent.
   * @param messages - An array of objects representing the messages to be sent.
   */
  async produce(topic: string, message: Message) {
    await this.producer.send({ topic: topic, messages: [message] });
  }

  /**
   * Sends a batch of messages to a specified Kafka topic.
   *
   * @param topic - The Kafka topic to which the messages should be sent.
   * @param messages - An array of objects representing the messages to be sent.
   */
  // async sendBatch(topic: string, messages: Array<any>) {
  //   console.log(`KafkaService.sendBatch() for topic:${topic}`);
  //   const formattedMessages = messages.map((message) => ({
  //     value: JSON.stringify(message),
  //   }));
  //   await this.producer.send({
  //     topic,
  //     messages: formattedMessages,
  //   });
  // }

  /**
   * Creates and returns a Kafka consumer connected to the specified group.
   * This consumer will be used to subscribe to topics and consume messages.
   *
   * @param groupId - The consumer group ID to which this consumer should belong.
   * @returns A promise that resolves to the connected Kafka consumer.
   */
  // async getConsumer(groupId: string): Promise<Consumer> {
  //   const consumer = this.kafka.consumer({ groupId });
  //   this.consumers.push(consumer);
  //   await consumer.connect();
  //   return consumer;
  // }

  /**
   * Disconnects the Kafka producer and all consumers when the module is destroyed.
   * This method is automatically called when the service is destroyed.
   */
  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
