"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CarIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowLeftIcon
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Booking {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  pickupLocation?: string
  dropoffLocation?: string
  createdAt: string
  car: {
    id: string
    make: string
    model: string
    year: number
    color?: string
    licensePlate: string
    transmission: string
    fuelType: string
    seats: number
    dailyRate: number
    imageUrl?: string
    agency: {
      id: string
      name: string
      address: string
      city: string
      country: string
      phone?: string
      email?: string
    }
  }
  user: {
    id: string
    name?: string
    email: string
    phone?: string
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
      } else {
        setError("Booking not found")
      }
    } catch (error) {
      console.error("Error fetching booking details:", error)
      setError("Failed to load booking details")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!booking) return

    const token = localStorage.getItem("token")
    if (!token) return

    setCancelling(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchBookingDetails()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setError("Failed to cancel booking")
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500"
      case "CONFIRMED": return "bg-blue-500"
      case "ACTIVE": return "bg-green-500"
      case "COMPLETED": return "bg-gray-500"
      case "CANCELLED": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const canCancel = booking && ["PENDING", "CONFIRMED"].includes(booking.status)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Booking not found"}</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <CarIcon className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Mox Rental Cars</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cars">
                <Button variant="ghost">Browse Cars</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600">Booking ID: {booking.id}</p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CarIcon className="h-5 w-5 mr-2" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {booking.car.imageUrl ? (
                      <img
                        src={booking.car.imageUrl}
                        alt={`${booking.car.make} ${booking.car.model}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <CarIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.car.make} {booking.car.model}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Year</p>
                        <p className="font-medium">{booking.car.year}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Color</p>
                        <p className="font-medium">{booking.car.color || "Standard"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Transmission</p>
                        <p className="font-medium">{booking.car.transmission}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fuel Type</p>
                        <p className="font-medium">{booking.car.fuelType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seats</p>
                        <p className="font-medium">{booking.car.seats}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">License Plate</p>
                        <p className="font-medium">{booking.car.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Daily Rate</p>
                        <p className="font-medium">${booking.car.dailyRate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rental Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Rental Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Pickup Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{format(new Date(booking.startDate), "EEEE, MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>10:00 AM</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                        <span>{booking.pickupLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Return Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{format(new Date(booking.endDate), "EEEE, MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span>10:00 AM</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                        <span>{booking.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agency Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Rental Agency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{booking.car.agency.name}</h4>
                    <p className="text-gray-600">{booking.car.agency.address}</p>
                    <p className="text-gray-600">{booking.car.agency.city}, {booking.car.agency.country}</p>
                  </div>
                  {booking.car.agency.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{booking.car.agency.phone}</span>
                    </div>
                  )}
                  {booking.car.agency.email && (
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{booking.car.agency.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate</span>
                    <span>${booking.car.dailyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Days</span>
                    <span>
                      {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Price</span>
                      <span className="text-blue-600">${booking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date</span>
                    <span>{format(new Date(booking.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                {canCancel && (
                  <Button 
                    onClick={handleCancelBooking} 
                    variant="destructive" 
                    className="w-full"
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{booking.user.name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{booking.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{booking.user.phone || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}