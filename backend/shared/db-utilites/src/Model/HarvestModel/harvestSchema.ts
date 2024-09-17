import { Schema } from 'mongoose';
import { HarvestModel } from './HarvestModel';

const HarvestStatusSchema = {
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
};

export const HarvestSchema = new Schema<HarvestModel>({
  harvestId: {
    type: String,
    require: true,
    unique: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  quality: {
    type: String,
    require: true,
  },
  harvestDate: {
    type: Date,
    require: true,
  },
  teaType: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  GSTNumber: {
    type: String,
    require: true,
  },
  harvestStatus: [HarvestStatusSchema],
  harvestByFarmerTxHash: {
    type: String,
    required: false,
  },
});
