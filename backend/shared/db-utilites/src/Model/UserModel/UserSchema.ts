import { UserRole } from '@app/db-utilites/Enums/enums';
import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  role: {
    enum: UserRole,
    type: String,
    require: true,
  },
  firmName: {
    type: String,
    require: true,
  },
  GSTNumber: {
    type: String,
    require: true,
  },
  mobileNumber: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  registerTeaTokenPlayersTxHash: {
    type: String,
    require: false,
  }
});
