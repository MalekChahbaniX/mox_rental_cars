import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICar extends Document {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  mileage: number;
  transmission: 'MANUAL' | 'AUTOMATIC' | 'SEMI_AUTOMATIC';
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  seats: number;
  dailyRate: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  agencyId: string;
}

const CarSchema: Schema<ICar> = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  color: { type: String },
  mileage: { type: Number, required: true },
  transmission: { 
    type: String, 
    enum: ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC'], 
    required: true 
  },
  fuelType: { 
    type: String, 
    enum: ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'], 
    required: true 
  },
  seats: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE'], 
    default: 'AVAILABLE' 
  },
  description: { type: String },
  imageUrl: { type: String },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual id field that returns _id as a string
CarSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
// Ensure virtual fields are serialised
CarSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;