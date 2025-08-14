import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const booking = await db.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        car: {
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status, pickupLocation, dropoffLocation } = await request.json()

    // Check if booking exists and belongs to user
    const existingBooking = await db.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      )
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["ACTIVE", "CANCELLED"],
      "ACTIVE": ["COMPLETED"],
      "COMPLETED": [],
      "CANCELLED": []
    }

    if (status && validTransitions[existingBooking.status] && !validTransitions[existingBooking.status].includes(status)) {
      return NextResponse.json(
        { message: `Cannot change booking status from ${existingBooking.status} to ${status}` },
        { status: 400 }
      )
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(pickupLocation && { pickupLocation }),
        ...(dropoffLocation && { dropoffLocation })
      },
      include: {
        car: {
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedBooking)

  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if booking exists and belongs to user
    const existingBooking = await db.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      )
    }

    // Only allow cancellation of pending or confirmed bookings
    if (!["PENDING", "CONFIRMED"].includes(existingBooking.status)) {
      return NextResponse.json(
        { message: "Cannot cancel booking in current status" },
        { status: 400 }
      )
    }

    // Update booking status to cancelled instead of deleting
    const cancelledBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED"
      }
    })

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking
    })

  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}