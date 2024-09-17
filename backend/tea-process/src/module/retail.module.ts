import { Module } from '@nestjs/common';
import { RetailController } from '../controller/retail.controller';
import { RetailService } from '../service/retail.service';
import { RetailBlockchainService } from '../blockchain/retail.blockchain';
import { EthUtilitesModule } from '@app/eth-utilites';

@Module({
  imports: [EthUtilitesModule],
  controllers: [RetailController],
  providers: [RetailService, RetailBlockchainService],
})
export class RetailModule {}
