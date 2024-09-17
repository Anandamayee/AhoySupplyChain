import { Global, Module } from '@nestjs/common';
import { FarmerModule } from './module/farmer.module';
import { ProcessorModule } from './module/processor.module';
import { TransporterModule } from './module/transporter.module';
import { RetailModule } from './module/retail.module';
import { ConsumerModule } from './module/consumer.module';
import { FarmerController } from './controller/farmer.controller';
import { ProcessorController } from './controller/processor.controller';
import { TransporterController } from './controller/transporter.controller';
import { RetailController } from './controller/retail.controller';
import { ConsumerController } from './controller/consumer.controller';
import { FarmerService } from './service/farmer.service';
import { ProcessorService } from './service/processor.service';
import { TransporterService } from './service/transporter.service';
import { RetailService } from './service/retail.service';
import { ConsumerService } from './service/consumer.service';
import { DbUtilitesModule } from '@app/db-utilites';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import * as https from 'https';
import { KafkaProducer } from './kafka/kafka.producer';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaConsumer } from './kafka/kafka.consumer';
import { FarmerQueueReceiver } from './queuecontroller/farmer.queue';
import { FarmerBlockchainService } from './blockchain/farmer.blockchain';
import { ProcessorBlockchainService } from './blockchain/processor.blockchain';
import { TransporterBlockchainService } from './blockchain/transporter.blockchain';
import { ProcessorQueueReceiver } from './queuecontroller/processor.queue';
import { RetailBlockchainService } from './blockchain/retail.blockchain';
import { EthUtilitesModule } from '@app/eth-utilites';
import { UserGuardsModule } from '@app/user-guard';
import { ConsumerBlockchainService } from './blockchain/consumer.blockchain';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: 'config.env',  //# remove for production
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<boolean>('TEA_LOCALHOST')
          ? {}
          : {
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: 3600,
          },
        };
      },
    }),
    FarmerModule,
    ProcessorModule,
    TransporterModule,
    RetailModule,
    ConsumerModule,
    DbUtilitesModule,
    KafkaModule,
    EthUtilitesModule,
    UserGuardsModule,
  ],
  controllers: [
    FarmerController,
    ProcessorController,
    TransporterController,
    RetailController,
    ConsumerController,
  ],
  providers: [
    FarmerService,
    ProcessorService,
    TransporterService,
    RetailService,
    ConsumerService,
    KafkaConsumer,
    KafkaProducer,
    FarmerQueueReceiver,
    ProcessorQueueReceiver,
    // TransporterQueueReceiver,
    FarmerBlockchainService,
    ProcessorBlockchainService,
    TransporterBlockchainService,
    RetailBlockchainService,
    ConsumerBlockchainService
  ],
})
export class TeaProcessModule {}
