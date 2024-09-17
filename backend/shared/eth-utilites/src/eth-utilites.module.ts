import { Module } from '@nestjs/common';
import { EthUtilitesService } from './eth-utilites.service';
import { ConfigModule } from '@nestjs/config';
import { BlockchainHelper } from './BlockchainHelper';
import { DbUtilitesModule } from '@app/db-utilites';

@Module({
  providers: [
    {
      provide: 'ETHEREUM_SERVICE',
      useClass: EthUtilitesService,
    },
    {
      provide: 'BESU_HELPER',
      useClass: BlockchainHelper,
    },
  ],
  exports: ['BESU_HELPER', 'ETHEREUM_SERVICE'],
  imports: [ConfigModule, DbUtilitesModule],
})
export class EthUtilitesModule {}
