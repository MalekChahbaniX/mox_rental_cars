import mongoose from 'mongoose';
import User, { IUser } from '@/models/User';
import Car, { ICar } from '@/models/Car';
import Agency, { IAgency } from '@/models/Agency';
import Booking, { IBooking } from '@/models/Booking';

// Connect to MongoDB
export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL!, {
      // Add any mongoose connection options here
    });
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// User operations
export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = new User(userData);
  return await user.save();
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

// Car operations
export const createCar = async (carData: Partial<ICar>): Promise<ICar> => {
  const car = new Car(carData);
  return await car.save();
};

export const findCarByLicensePlate = async (licensePlate: string): Promise<ICar | null> => {
  return await Car.findOne({ licensePlate });
};

export const findCarById = async (id: string): Promise<ICar | null> => {
  return await Car.findById(id).populate('agencyId');
};

export const findAllCars = async (limit: number = 12, offset: number = 0): Promise<ICar[]> => {
  return await Car.find().populate('agencyId').limit(limit).skip(offset).sort({ createdAt: -1 });
};

export const countCars = async (): Promise<number> => {
  return await Car.countDocuments();
};

// Agency operations
export const createAgency = async (agencyData: Partial<IAgency>): Promise<IAgency> => {
  const agency = new Agency(agencyData);
  return await agency.save();
};

export const findAllAgencies = async (limit: number = 50, offset: number = 0): Promise<IAgency[]> => {
  return await Agency.find().limit(limit).skip(offset).sort({ name: 1 });
};

export const countAgencies = async (): Promise<number> => {
  return await Agency.countDocuments();
};

export const findAgencyById = async (id: string): Promise<IAgency | null> => {
  return await Agency.findById(id);
};

// Booking operations
export const createBooking = async (bookingData: Partial<IBooking>): Promise<IBooking> => {
  const booking = new Booking(bookingData);
  return await booking.save();
};

export const findBookingsByUserId = async (userId: string, limit: number = 10, offset: number = 0): Promise<IBooking[]> => {
  return await Booking.find({ userId })
    .populate({
      path: 'car',
      populate: {
        path: 'agency',
        select: 'id name city country'
      }
    })
    .limit(limit)
    .skip(offset)
    .sort({ createdAt: -1 });
};

export const countBookingsByUserId = async (userId: string): Promise<number> => {
  return await Booking.countDocuments({ userId });
};

export const findOverlappingBookings = async (carId: string, startDate: Date, endDate: Date): Promise<IBooking | null> => {
  return await Booking.findOne({
    carId,
    status: {
      $in: ["PENDING", "CONFIRMED", "ACTIVE"]
    },
    $or: [
      {
        $and: [
          { startDate: { $lte: endDate } },
          { endDate: { $gte: startDate } }
        ]
      }
    ]
  });
};

export default {
  connectToDatabase,
  createUser,
  findUserByEmail,
  findUserById,
  createCar,
  findCarByLicensePlate,
  findCarById,
  findAllCars,
  countCars,
  createAgency,
  findAllAgencies,
  countAgencies,
  findAgencyById,
  createBooking,
  findBookingsByUserId,
  countBookingsByUserId,
  findOverlappingBookings
};