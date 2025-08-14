"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CarIcon, 
  UsersIcon, 
  CalendarIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  LogOutIcon,
  SettingsIcon,
  BarChart3Icon,
  ActivityIcon,
  MapPinIcon,
  StarIcon
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface DashboardStats {
  totalCars: number
  availableCars: number
  rentedCars: number
  totalUsers: number
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalRevenue: number
  monthlyRevenue: number
}

interface RecentBooking {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
  car: {
    make: string
    model: string
    year: number
  }
}

interface RecentUser {
  id: string
  email: string
  name?: string
  createdAt: string
  bookings: Array<any>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAuth()
    fetchDashboardData()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      window.location.href = "/admin"
    }
  }

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch("/api/admin/bookings?limit=10", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setRecentBookings(bookingsData.bookings || [])
      }

      // Fetch recent users
      const usersResponse = await fetch("/api/admin/users?limit=10", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setRecentUsers(usersData.users || [])
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/admin"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ActivityIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your car rental platform</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CarIcon className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Total Cars</p>
                    <p className="text-2xl font-bold">{stats.totalCars}</p>
                    <p className="text-xs text-green-600">
                      {stats.availableCars} available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    <p className="text-xs text-blue-600">
                      {stats.activeBookings} active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSignIcon className="h-8 w-8 text-orange-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">
                      ${stats.monthlyRevenue.toLocaleString()} this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
            <TabsTrigger value="users">New Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUpIcon className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Car Utilization</span>
                        <span className="font-medium">
                          {stats.totalCars > 0 ? Math.round((stats.rentedCars / stats.totalCars) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Booking Completion Rate</span>
                        <span className="font-medium">
                          {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Booking Value</span>
                        <span className="font-medium">
                          ${stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings) : 0}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3Icon className="h-5 w-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">System Status</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Database</span>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">API Services</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {booking.car.make} {booking.car.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.user.name || booking.user.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${booking.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No recent bookings found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
              </CardHeader>
              <CardContent>
                {recentUsers.length > 0 ? (
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {user.name || user.email}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(user.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {user.bookings.length} bookings
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No new users found.
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