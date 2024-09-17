import { UserRole } from '@app/db-utilites/Enums/enums';
import { Schema } from 'mongoose';

export const UserkeySchema = new Schema({
  account: {
    type: String,
    require: true,
  },
  GSTNumber: {
    type: String,
    require: true,
  },
  encryptedPrivateKey: {
    type: String,
    require: true,
  },
  encryptedKeyHash: {
    type: Buffer,
    require: true,
  },
});
