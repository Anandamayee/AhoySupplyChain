import { BatchStatus } from '@app/db-utilites/Enums/enums';
import { Schema } from 'mongoose';

export const BatchSchema = new Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    harvestIds: [
      {
        type: String,
        required: true,
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
    },
    quality: {
      type: String,
      required: true,
    },
    senderGst: {
      type: String,
      required: false,
    },
    receiverGst: {
      type: String,
      required: false,
    },
    gstNumberOfProcessor: {
      type: String,
      required: false,
    },
    gstNumberOfTransporter: {
      type: String,
      required: false,
    },
    gstNumberOfRetailer: {
      type: String,
      required: false,
    },
    departureDate: {
      type: Date,
      required: false,
    },
    arrivalDate: {
      type: Date,
      required: false,
    },
    batchStatus: [
      {
        status: {
          type: String,
          required: true,
          enum: [BatchStatus],
        },
        date: {
          type: Date,
          required: false,
        },
      },
    ],
    StorageDetails: [
      {
        humidity: {
          type: String,
          required: false,
        },
        temperature: {
          type: String,
          required: false,
        },
        date: {
          type: Date,
          required: false,
        }
      },
    ],
    ShippingDetails: [
      {
        senderName: {
          type: String,
          required: false,
        },
        receiverName: {
          type: String,
          required: false,
        },
        carrierName: {
          type: String,
          required: false,
        },
        departureDate: {
          type: Date,
          required: false,
        },
        arrivalDate: {
          type: Date,
          required: false,
        },
      },
    ],
    batchingHarvestByProcessorTxHash: {
      type: String,
      required: false,
    },
    teaTokenTrackingByTransporterTxHash: {
      type: String,
      required: false,
    },
    teaPlacedInShelvesByRetailerTxHash: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);
