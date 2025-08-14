"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CarIcon, 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  CreditCardIcon,
  ClockIcon
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
    imageUrl?: string
    dailyRate: number
    agency: {
      name: string
      city: string
      country: string
    }
  }
}

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  avatar?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAuth()
    fetchUserData()
    fetchBookings()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
    }
  }

  const fetchUserData = () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          role: payload.role
        })
      } catch (error) {
        console.error("Error parsing token:", error)
      }
    }
  }

  const fetchBookings = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("/api/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchBookings()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setError("Failed to cancel booking")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
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

  const upcomingBookings = bookings.filter(b => 
    ["PENDING", "CONFIRMED"].includes(b.status) && 
    new Date(b.startDate) > new Date()
  )

  const activeBookings = bookings.filter(b => b.status === "ACTIVE")
  const pastBookings = bookings.filter(b => 
    ["COMPLETED", "CANCELLED"].includes(b.status) || 
    new Date(b.endDate) < new Date()
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
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
              <Link href="/cars">
                <Button variant="ghost">Browse Cars</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-600">Manage your bookings and account settings</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-blue-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-green-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CarIcon className="h-8 w-8 text-purple-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold">{activeBookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-8 w-8 text-orange-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ${bookings.reduce((sum, b) => sum + b.totalPrice, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <CarIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {booking.car.make} {booking.car.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(booking.startDate), "MMM dd, yyyy")} -{" "}
                              {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            ${booking.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No bookings yet. <Link href="/cars" className="text-blue-600 hover:underline">Browse cars</Link> to make your first booking!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <CarIcon className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.car.make} {booking.car.model}
                              </h3>
                              <p className="text-gray-600">{booking.car.year}</p>
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {booking.car.agency.name}, {booking.car.agency.city}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Pickup Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.startDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Return Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="font-medium">${booking.totalPrice}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Pickup: {booking.pickupLocation}
                          </div>
                          <div className="space-x-2">
                            <Link href={`/bookings/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            {["PENDING", "CONFIRMED"].includes(booking.status) && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No upcoming bookings. <Link href="/cars" className="text-blue-600 hover:underline">Browse cars</Link> to make a booking!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                              <CarIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.car.make} {booking.car.model}
                              </h3>
                              <p className="text-gray-600">{booking.car.year}</p>
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {booking.car.agency.name}, {booking.car.agency.city}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-500">
                            ACTIVE
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Pickup Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.startDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Return Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="font-medium">${booking.totalPrice}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Pickup: {booking.pickupLocation}
                          </div>
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No active rentals at the moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <CarIcon className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.car.make} {booking.car.model}
                              </h3>
                              <p className="text-gray-600">{booking.car.year}</p>
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {booking.car.agency.name}, {booking.car.agency.city}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Pickup Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.startDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Return Date</p>
                            <p className="font-medium">
                              {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="font-medium">${booking.totalPrice}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Booking Date: {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                          </div>
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No past bookings found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}