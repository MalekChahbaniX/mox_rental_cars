import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import {
  connectToDatabase,
  findBookingsByUserId,
  countBookingsByUserId,
  createBooking,
  findCarById,
  findOverlappingBookings
} from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

interface JwtPayload {
  userId: string
  email: string
  role: string
}

function getUserFromToken(request: NextRequest): JwtPayload | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Connect to database
    await connectToDatabase();

    const bookings = await findBookingsByUserId(user.userId, limit, offset);
    const total = await countBookingsByUserId(user.userId);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { carId, startDate, endDate, pickupLocation, dropoffLocation } = await request.json()

    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Car ID, start date, and end date are required" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase();

    // Check if car exists and is available
    const car = await findCarById(carId);

    if (!car) {
      return NextResponse.json(
        { message: "Car not found" },
        { status: 404 }
      )
    }

    if (car.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Car is not available for booking" },
        { status: 400 }
      )
    }

    // Check for overlapping bookings
    const overlappingBooking = await findOverlappingBookings(carId, new Date(startDate), new Date(endDate));

    if (overlappingBooking) {
      return NextResponse.json(
        { message: "Car is already booked for the selected dates" },
        { status: 400 }
      )
    }

    // Calculate total price
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * car.dailyRate

    // Create booking
    const booking = await createBooking({
      userId: user.userId,
      carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "PENDING",
      pickupLocation: pickupLocation || undefined,
      dropoffLocation: dropoffLocation || undefined
    });

    return NextResponse.json(booking, { status: 201 })

  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}