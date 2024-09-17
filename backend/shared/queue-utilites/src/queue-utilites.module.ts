import { Module } from '@nestjs/common';
import { QueueUtilitesService } from './queue-utilites.service';

@Module({
  providers: [QueueUtilitesService],
  exports: [QueueUtilitesService],
})
export class QueueUtilitesModule {}
