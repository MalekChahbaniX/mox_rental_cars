import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgency extends Document {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgencySchema: Schema<IAgency> = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  latitude: { type: Number },
  longitude: { type: Number }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual id field that returns _id as a string
AgencySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
AgencySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Agency: Model<IAgency> = mongoose.models.Agency || mongoose.model<IAgency>('Agency', AgencySchema);

export default Agency;