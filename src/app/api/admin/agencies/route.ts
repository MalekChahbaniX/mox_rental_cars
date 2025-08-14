import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import {
  connectToDatabase,
  findAllAgencies,
  countAgencies,
  createAgency
} from "@/lib/database"

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
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Connect to database
    await connectToDatabase();

    const agencies = await findAllAgencies(limit, offset);
    const total = await countAgencies();

    return NextResponse.json({
      agencies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching admin agencies:", error)
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

    // Only admins can create agencies
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, address, city, country, phone, email, latitude, longitude } = body

    // Validate required fields
    if (!name || !address || !city || !country) {
      return NextResponse.json(
        { message: "Name, address, city, and country are required" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase();

    const agency = await createAgency({
      name,
      address,
      city,
      country,
      phone: phone || undefined,
      email: email || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined
    });

    return NextResponse.json(agency, { status: 201 })

  } catch (error) {
    console.error("Error creating agency:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}