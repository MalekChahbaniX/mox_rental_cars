const mongoose = require('mongoose');
require('dotenv').config();

// Sample agencies data
const agencies = [
  {
    name: "Tunis Car Rentals",
    address: "15 Avenue Habib Bourguiba",
    city: "Tunis",
    country: "Tunisia",
    phone: "+216 12 345 678",
    email: "info@tunisrentals.com"
  },
  {
    name: "Sousse Auto Location",
    address: "8 Rue de la Liberté",
    city: "Sousse",
    country: "Tunisia",
    phone: "+216 21 456 789",
    email: "contact@sousseauto.com"
  },
  {
    name: "Djerba Wheels",
    address: "Port de plaisance de Djerba",
    city: "Djerba",
    country: "Tunisia",
    phone: "+216 31 567 890",
    email: "info@djerbawheels.com"
  }
];

// Sample cars data
const cars = [
  {
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    licensePlate: "TN123456",
    color: "White",
    mileage: 15000,
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 45,
    status: "AVAILABLE",
    description: "Compact and fuel-efficient sedan perfect for city driving.",
    imageUrl: "/images/toyota-corolla.jpg"
  },
  {
    make: "Renault",
    model: "Clio",
    year: 2021,
    licensePlate: "TN234567",
    color: "Blue",
    mileage: 22000,
    transmission: "MANUAL",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 35,
    status: "AVAILABLE",
    description: "Popular compact car with excellent handling and comfort.",
    imageUrl: "/images/renault-clio.jpg"
  },
  {
    make: "Peugeot",
    model: "308",
    year: 2023,
    licensePlate: "TN345678",
    color: "Black",
    mileage: 8000,
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 50,
    status: "AVAILABLE",
    description: "Spacious and comfortable family car with modern features.",
    imageUrl: "/images/peugeot-308.jpg"
  },
  {
    make: "Volkswagen",
    model: "Golf",
    year: 2022,
    licensePlate: "TN456789",
    color: "Gray",
    mileage: 18000,
    transmission: "MANUAL",
    fuelType: "DIESEL",
    seats: 5,
    dailyRate: 55,
    status: "AVAILABLE",
    description: "Reliable hatchback with excellent build quality and performance.",
    imageUrl: "/images/vw-golf.jpg"
  },
  {
    make: "Dacia",
    model: "Sandero",
    year: 2020,
    licensePlate: "TN567890",
    color: "Red",
    mileage: 30000,
    transmission: "MANUAL",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 30,
    status: "AVAILABLE",
    description: "Budget-friendly option with surprising comfort and space.",
    imageUrl: "/images/dacia-sandero.jpg"
  },
  {
    make: "BMW",
    model: "Series 3",
    year: 2023,
    licensePlate: "TN678901",
    color: "White",
    mileage: 5000,
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 95,
    status: "AVAILABLE",
    description: "Luxury sedan with powerful engine and premium features.",
    imageUrl: "/images/bmw-3series.jpg"
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    licensePlate: "TN789012",
    color: "Black",
    mileage: 12000,
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 110,
    status: "AVAILABLE",
    description: "Executive luxury with cutting-edge technology and comfort.",
    imageUrl: "/images/mercedes-cclass.jpg"
  },
  {
    make: "Renault",
    model: "Kangoo",
    year: 2021,
    licensePlate: "TN890123",
    color: "White",
    mileage: 25000,
    transmission: "MANUAL",
    fuelType: "DIESEL",
    seats: 5,
    dailyRate: 40,
    status: "AVAILABLE",
    description: "Versatile utility vehicle perfect for work or family use.",
    imageUrl: "/images/renault-kangoo.jpg"
  },
  {
    make: "Nissan",
    model: "Qashqai",
    year: 2023,
    licensePlate: "TN901234",
    color: "Blue",
    mileage: 7000,
    transmission: "AUTOMATIC",
    fuelType: "HYBRID",
    seats: 5,
    dailyRate: 75,
    status: "AVAILABLE",
    description: "Compact SUV with excellent fuel economy and modern features.",
    imageUrl: "/images/nissan-qashqai.jpg"
  },
  {
    make: "Dacia",
    model: "Duster",
    year: 2022,
    licensePlate: "TN012345",
    color: "Orange",
    mileage: 15000,
    transmission: "MANUAL",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 48,
    status: "AVAILABLE",
    description: "Affordable SUV with good ground clearance and spacious interior.",
    imageUrl: "/images/dacia-duster.jpg"
  }
];

// Agency Schema
const agencySchema = new mongoose.Schema({
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

// Car Schema
const carSchema = new mongoose.Schema({
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
  agencyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Agency' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Models
const Agency = mongoose.model('Agency', agencySchema);
const Car = mongoose.model('Car', carSchema);

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database');

    // Clear existing data
    console.log('Clearing existing data...');
    await Agency.deleteMany({});
    await Car.deleteMany({});
    console.log('Database cleared');

    // Create agencies
    console.log('Creating agencies...');
    const createdAgencies = [];
    for (const agencyData of agencies) {
      const agency = new Agency(agencyData);
      const savedAgency = await agency.save();
      createdAgencies.push(savedAgency);
      console.log(`Created agency: ${savedAgency.name}`);
    }

    // Create cars
    console.log('Creating cars...');
    for (let i = 0; i < cars.length; i++) {
      // Assign cars to agencies in a round-robin fashion
      const agencyId = createdAgencies[i % createdAgencies.length]._id;
      const carData = {
        ...cars[i],
        agencyId: agencyId
      };
      
      const car = new Car(carData);
      const savedCar = await car.save();
      console.log(`Created car: ${savedCar.make} ${savedCar.model} (${savedCar.licensePlate})`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();