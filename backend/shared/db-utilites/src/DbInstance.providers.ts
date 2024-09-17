import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import * as cryptoJs from 'crypto-js';
import { UserSchema } from './Model/UserModel/UserSchema';
import { RefreshTokenSchema } from './Model/SessionModel/sessionSchema';
import { HarvestSchema } from './Model/HarvestModel/harvestSchema';
import { UserkeySchema } from './Model/UserModel/UserKeySchema';
import { BatchSchema } from './Model/BatchModel/batchSchema';

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get<string>('CPC_MONGODB_CNNECTIONSTRING'),
});

export const models = [
  { name: 'User', schema: UserSchema },
  { name: 'Session', schema: RefreshTokenSchema },
  { name: 'Batch', schema: BatchSchema },
  { name: 'Harvest', schema: HarvestSchema },
  { name: 'UserKey', schema: UserkeySchema },
];

export const encryptData = async (
  configService: ConfigService,
  dataSecret: string,
  data: any,
) => {
  return cryptoJs.AES.encrypt(
    JSON.stringify(data),
    configService.get(dataSecret),
  ).toString();
};

export const decryptData = async (
  configService: ConfigService,
  dataSecret: string,
  data: any,
) => {
  const bytes = cryptoJs.AES.decrypt(data, configService.get(dataSecret));
  const dataObject = JSON.parse(bytes.toString(cryptoJs.enc.Utf8));
  return { bytes, dataObject };
};
