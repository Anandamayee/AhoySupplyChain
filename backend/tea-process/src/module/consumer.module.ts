import { Module } from '@nestjs/common';
import { ConsumerController } from '../controller/consumer.controller';
import { ConsumerService } from '../service/consumer.service';
import { EthUtilitesModule } from '@app/eth-utilites';
import { ConsumerBlockchainService } from '../blockchain/consumer.blockchain';

@Module({
  imports: [EthUtilitesModule],
  controllers: [ConsumerController],
  providers: [ConsumerService, ConsumerBlockchainService],
})
export class ConsumerModule {}
