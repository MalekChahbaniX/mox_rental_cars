"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CalendarIcon, 
  SearchIcon, 
  CarIcon, 
  UsersIcon,
  MapPinIcon,
  DollarSignIcon,
  LogOutIcon,
  SettingsIcon,
  FilterIcon,
  EyeIcon
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
  user: {
    id: string
    name?: string
    email: string
    phone?: string
  }
  car: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    dailyRate: number
    agency: {
      id: string
      name: string
      city: string
      country: string
    }
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    checkAuth()
    fetchBookings()
  }, [statusFilter, currentPage])

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      window.location.href = "/admin"
    }
  }

  const fetchBookings = async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      let url = `/api/admin/bookings?page=${currentPage}&limit=10`
      if (statusFilter) {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setTotalPages(data.pagination?.pages || 1)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        window.location.href = "/admin"
      } else {
        setError("Failed to load bookings")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/admin"
  }

  const filteredBookings = bookings.filter(booking =>
    (booking.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.car.agency.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <SettingsIcon className="h-8 w-8 text-red-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Admin Portal</span>
              </div>
              <div className="hidden md:flex space-x-4">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm">Users</Button>
                </Link>
                <Link href="/admin/cars">
                  <Button variant="ghost" size="sm">Cars</Button>
                </Link>
                <Link href="/admin/agencies">
                  <Button variant="ghost" size="sm">Agencies</Button>
                </Link>
                <Link href="/admin/bookings">
                  <Button variant="ghost" size="sm">Bookings</Button>
                </Link>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Manage all rental bookings and reservations</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings by user, car, or agency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Bookings ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.car.make} {booking.car.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.car.year} • {booking.car.licensePlate}
                          </p>
                          <div className="flex items-center mt-1">
                            <MapPinIcon className="h-3 w-3 text-gray-400 mr-1" />
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
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium">
                          {booking.user.name || booking.user.email}
                        </p>
                        {booking.user.phone && (
                          <p className="text-sm text-gray-500">{booking.user.phone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rental Period</p>
                        <p className="font-medium">
                          {format(new Date(booking.startDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500">
                          to {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="font-medium text-lg text-blue-600">
                          ${booking.totalPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${booking.car.dailyRate}/day
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Booking ID: {booking.id}</span>
                          <span>•</span>
                          <span>Created: {format(new Date(booking.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter ? "Try adjusting your filters." : "No bookings have been made yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}