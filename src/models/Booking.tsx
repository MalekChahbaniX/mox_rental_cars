import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  id: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  pickupLocation?: string;
  dropoffLocation?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  carId: string;
}

const BookingSchema: Schema<IBooking> = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  pickupLocation: { type: String },
  dropoffLocation: { type: String },
  userId: { type: String, required: true, ref: 'User' },
  carId: { type: String, required: true, ref: 'Car' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual id field that returns _id as a string
BookingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
BookingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;