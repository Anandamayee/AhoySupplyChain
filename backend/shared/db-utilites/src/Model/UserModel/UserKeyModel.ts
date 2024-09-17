import { UserRole } from '@app/db-utilites/Enums/enums';
import { Schema } from 'mongoose';

export class UserKeyModel {
  account: string;
  GSTNumber: string;
  encryptedPrivateKey: string;
}
