"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  CarIcon, 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  UsersIcon, 
  FuelIcon, 
  SettingsIcon,
  ClockIcon,
  ShieldIcon,
  AirVentIcon,
  NavigationIcon
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Car {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color?: string
  mileage: number
  transmission: string
  fuelType: string
  seats: number
  dailyRate: number
  status: string
  description?: string
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
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    user: {
      name: string
    }
    createdAt: string
  }>
}

export default function CarDetailPage() {
  const params = useParams()
  const carId = params.id as string
  
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchCarDetails()
  }, [carId])

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`/api/cars/${carId}`)
      if (response.ok) {
        const data = await response.json()
        setCar(data)
      } else {
        setError("Car not found")
      }
    } catch (error) {
      console.error("Error fetching car details:", error)
      setError("Failed to load car details")
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = async () => {
    if (!pickupDate || !returnDate) {
      setError("Please select pickup and return dates")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    setBookingLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car?.id,
          startDate: pickupDate.toISOString(),
          endDate: returnDate.toISOString(),
          pickupLocation: car?.agency.address,
          dropoffLocation: car?.agency.address
        })
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = "/dashboard"
      } else {
        setError(data.message || "Booking failed")
      }
    } catch (error) {
      console.error("Booking error:", error)
      setError("Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  const calculateTotalPrice = () => {
    if (!pickupDate || !returnDate || !car) return 0
    
    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * car.dailyRate
  }

  const averageRating = car?.reviews?.length 
    ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Car not found"}</p>
          <Link href="/cars">
            <Button className="mt-4">Back to Cars</Button>
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
            <Link href="/" className="flex items-center">
              <CarIcon className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Mox Rental Cars</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Images */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-200 rounded-t-lg">
                  {car.imageUrl ? (
                    <img
                      src={car.imageUrl}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-t-lg">
                      <CarIcon className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {car.make} {car.model}
                      </h1>
                      <p className="text-gray-600">{car.year} • {car.color || "Standard Color"}</p>
                    </div>
                    <Badge className={car.status === "AVAILABLE" ? "bg-green-500" : "bg-red-500"}>
                      {car.status}
                    </Badge>
                  </div>

                  <div className="flex items-center mb-4">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({car.reviews.length} reviews)</span>
                  </div>

                  <p className="text-gray-700 mb-6">{car.description || "A reliable and comfortable vehicle perfect for your journey."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <UsersIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold">{car.seats}</p>
                    <p className="text-sm text-gray-600">Seats</p>
                  </div>
                  <div className="text-center">
                    <FuelIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold">{car.fuelType}</p>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                  </div>
                  <div className="text-center">
                    <SettingsIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold">{car.transmission}</p>
                    <p className="text-sm text-gray-600">Transmission</p>
                  </div>
                  <div className="text-center">
                    <ClockIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="font-semibold">{car.mileage.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Mileage (km)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldIcon className="h-5 w-5 mr-2" />
                  Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <AirVentIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">Air Conditioning</span>
                  </div>
                  <div className="flex items-center">
                    <NavigationIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">GPS Navigation</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldIcon className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm">Insurance Included</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm">24/7 Support</span>
                  </div>
                  <div className="flex items-center">
                    <CarIcon className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm">Free Cancellation</span>
                  </div>
                  <div className="flex items-center">
                    <FuelIcon className="h-4 w-4 text-indigo-600 mr-2" />
                    <span className="text-sm">Unlimited Mileage</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {car.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {car.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">{review.user.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(review.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet. Be the first to review this car!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl">
                  ${car.dailyRate}
                  <span className="text-sm font-normal text-gray-600">/day</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pickup Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Return Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {pickupDate && returnDate && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Price</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${calculateTotalPrice()}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBookNow} 
                  className="w-full" 
                  disabled={bookingLoading || car.status !== "AVAILABLE"}
                >
                  {bookingLoading ? "Processing..." : "Book Now"}
                </Button>

                {car.status !== "AVAILABLE" && (
                  <p className="text-sm text-red-600 text-center">
                    This car is currently not available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">{car.agency.name}</h4>
                  <p className="text-gray-600">{car.agency.address}</p>
                  <p className="text-gray-600">{car.agency.city}, {car.agency.country}</p>
                  {car.agency.phone && (
                    <p className="text-sm text-blue-600">{car.agency.phone}</p>
                  )}
                  {car.agency.email && (
                    <p className="text-sm text-blue-600">{car.agency.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}