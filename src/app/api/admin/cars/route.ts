import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

interface JwtPayload {
  userId: string
  email: string
  role: string
}

function getAdminUserFromToken(request: NextRequest): JwtPayload | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    
    // Check if user has admin role
    if (!["ADMIN", "STAFF"].includes(decoded.role)) {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getAdminUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const agencyId = searchParams.get("agencyId")
    const offset = (page - 1) * limit

    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }
    if (agencyId) {
      whereClause.agencyId = agencyId
    }

    const cars = await db.car.findMany({
      where: whereClause,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: offset,
      take: limit
    })

    const total = await db.car.count({
      where: whereClause
    })

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
    console.error("Error fetching admin cars:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAdminUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

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

    // Check if license plate already exists
    const existingCar = await db.car.findUnique({
      where: { licensePlate }
    })

    if (existingCar) {
      return NextResponse.json(
        { message: "Car with this license plate already exists" },
        { status: 409 }
      )
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { message: "Agency not found" },
        { status: 404 }
      )
    }

    const car = await db.car.create({
      data: {
        make,
        model,
        year,
        licensePlate,
        color: color || null,
        mileage: mileage || 0,
        transmission,
        fuelType,
        seats,
        dailyRate,
        description: description || null,
        agencyId
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })

    return NextResponse.json(car, { status: 201 })

  } catch (error) {
    console.error("Error creating car:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}