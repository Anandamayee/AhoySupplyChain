import { Module } from '@nestjs/common';
import { TransporterController } from '../controller/transporter.controller';
import { TransporterService } from '../service/transporter.service';
import { TransporterBlockchainService } from '../blockchain/transporter.blockchain';
import { EthUtilitesModule } from '@app/eth-utilites';

@Module({
  imports: [EthUtilitesModule],
  controllers: [TransporterController],
  providers: [TransporterService, TransporterBlockchainService],
})
export class TransporterModule {}
