import { Module } from '@nestjs/common';
import { FarmerController } from '../controller/farmer.controller';
import { FarmerService } from '../service/farmer.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { FarmerBlockchainService } from '../blockchain/farmer.blockchain';
import { EthUtilitesModule } from '@app/eth-utilites';

@Module({
  imports: [EthUtilitesModule],
  controllers: [FarmerController],
  providers: [FarmerService, KafkaProducer, FarmerBlockchainService],
  exports:[FarmerService]
})
export class FarmerModule {}
