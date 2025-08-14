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

    // Get current date and first day of current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all stats in parallel
    const [
      totalCars,
      availableCars,
      rentedCars,
      totalUsers,
      totalBookings,
      activeBookings,
      completedBookings,
      monthlyBookings
    ] = await Promise.all([
      // Total cars
      db.car.count(),
      
      // Available cars
      db.car.count({
        where: { status: "AVAILABLE" }
      }),
      
      // Rented cars
      db.car.count({
        where: { status: "RENTED" }
      }),
      
      // Total users
      db.user.count({
        where: { role: "USER" }
      }),
      
      // Total bookings
      db.booking.count(),
      
      // Active bookings
      db.booking.count({
        where: { status: "ACTIVE" }
      }),
      
      // Completed bookings
      db.booking.count({
        where: { status: "COMPLETED" }
      }),
      
      // Monthly bookings for revenue calculation
      db.booking.findMany({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          },
          status: {
            in: ["COMPLETED", "ACTIVE"]
          }
        },
        select: {
          totalPrice: true
        }
      })
    ])

    // Calculate total revenue from all completed bookings
    const totalRevenueResult = await db.booking.aggregate({
      where: {
        status: {
          in: ["COMPLETED", "ACTIVE"]
        }
      },
      _sum: {
        totalPrice: true
      }
    })

    const totalRevenue = totalRevenueResult._sum.totalPrice || 0

    // Calculate monthly revenue
    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

    const stats = {
      totalCars,
      availableCars,
      rentedCars,
      totalUsers,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      monthlyRevenue
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}