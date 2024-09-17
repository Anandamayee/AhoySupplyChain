import { Module } from '@nestjs/common';
import { ProcessorController } from '../controller/processor.controller';
import { ProcessorService } from '../service/processor.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { ProcessorBlockchainService } from '../blockchain/processor.blockchain';
import { JwtService } from '@nestjs/jwt';
import { FarmerModule } from './farmer.module';
import { EthUtilitesModule } from '@app/eth-utilites';

@Module({
  imports: [EthUtilitesModule, FarmerModule],
  controllers: [ProcessorController],
  providers: [
    ProcessorService,
    KafkaProducer,
    ProcessorBlockchainService,
    JwtService,
  ],
})
export class ProcessorModule {}
