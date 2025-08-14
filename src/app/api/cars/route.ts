import { NextRequest, NextResponse } from "next/server"
import {
  connectToDatabase,
  findAllCars,
  countCars,
  createCar,
  findCarByLicensePlate,
  findAgencyById
} from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    const cars = await findAllCars(limit, offset)
    const total = await countCars()

    return NextResponse.json({
      cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      make,
      model,
      year,
      licensePlate,
      color,
      mileage,
      transmission,
      fuelType,
      seats,
      dailyRate,
      description,
      agencyId
    } = body

    // Validate required fields
    if (!make || !model || !year || !licensePlate || !transmission || !fuelType || !seats || !dailyRate || !agencyId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase();

    // Check if license plate already exists
    const existingCar = await findCarByLicensePlate(licensePlate);

    if (existingCar) {
      return NextResponse.json(
        { message: "Car with this license plate already exists" },
        { status: 409 }
      )
    }

    // Check if agency exists
    const agency = await findAgencyById(agencyId);

    if (!agency) {
      return NextResponse.json(
        { message: "Agency not found" },
        { status: 404 }
      )
    }

    const car = await createCar({
      make,
      model,
      year,
      licensePlate,
      color: color || undefined,
      mileage: mileage || 0,
      transmission,
      fuelType,
      seats,
      dailyRate,
      description: description || undefined,
      agencyId
    });

    return NextResponse.json(car, { status: 201 })

  } catch (error) {
    console.error("Error creating car:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}