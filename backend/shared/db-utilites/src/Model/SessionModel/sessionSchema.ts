import mongoose from 'mongoose';

export const RefreshTokenSchema = new mongoose.Schema({
  payload: { type: String, require: true },
  validUntil: { type: Date, require: true },
  sessionId: { type: String, require: true },
});

// Add an index on sessionId for faster lookups
RefreshTokenSchema.index({ sessionId: 1 });

// TTL Index to automatically remove expired sessions
// Set expireAfterSeconds to 0 so the TTL is based on the validUntil field
RefreshTokenSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });