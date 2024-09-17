import { Module } from '@nestjs/common';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';

@Module({
  imports: [],
  //   imports: [DatabaseModule],
  providers: [KafkaProducer, KafkaConsumer],
  exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}
