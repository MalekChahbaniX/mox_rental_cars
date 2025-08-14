import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const car = await db.car.findUnique({
      where: { id: params.id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
            phone: true,
            email: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { message: "Car not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(car)

  } catch (error) {
    console.error("Error fetching car:", error)
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
      status,
      description,
      agencyId
    } = body

    // Check if car exists
    const existingCar = await db.car.findUnique({
      where: { id: params.id }
    })

    if (!existingCar) {
      return NextResponse.json(
        { message: "Car not found" },
        { status: 404 }
      )
    }

    // Check if license plate is being changed to one that already exists
    if (licensePlate && licensePlate !== existingCar.licensePlate) {
      const carWithSamePlate = await db.car.findUnique({
        where: { licensePlate }
      })

      if (carWithSamePlate) {
        return NextResponse.json(
          { message: "Car with this license plate already exists" },
          { status: 409 }
        )
      }
    }

    // If agencyId is provided, check if agency exists
    if (agencyId) {
      const agency = await db.agency.findUnique({
        where: { id: agencyId }
      })

      if (!agency) {
        return NextResponse.json(
          { message: "Agency not found" },
          { status: 404 }
        )
      }
    }

    const updatedCar = await db.car.update({
      where: { id: params.id },
      data: {
        ...(make && { make }),
        ...(model && { model }),
        ...(year && { year }),
        ...(licensePlate && { licensePlate }),
        ...(color !== undefined && { color }),
        ...(mileage !== undefined && { mileage }),
        ...(transmission && { transmission }),
        ...(fuelType && { fuelType }),
        ...(seats && { seats }),
        ...(dailyRate && { dailyRate }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(agencyId && { agencyId })
      },
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
    })

    return NextResponse.json(updatedCar)

  } catch (error) {
    console.error("Error updating car:", error)
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
    // Check if car exists
    const existingCar = await db.car.findUnique({
      where: { id: params.id }
    })

    if (!existingCar) {
      return NextResponse.json(
        { message: "Car not found" },
        { status: 404 }
      )
    }

    // Delete the car
    await db.car.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: "Car deleted successfully" }
    )

  } catch (error) {
    console.error("Error deleting car:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}