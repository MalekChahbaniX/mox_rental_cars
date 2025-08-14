"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CarIcon,
  PlusIcon,
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  SettingsIcon,
  EditIcon,
  TrashIcon,
  LogOutIcon,
  UsersIcon,
  FuelIcon
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
  createdAt: string
  agency: {
    id: string
    name: string
    city: string
    country: string
  }
  _count: {
    bookings: number
    reviews: number
  }
}

interface Agency {
  id: string
  name: string
  city: string
  country: string
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [agencyFilter, setAgencyFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Form state for creating car
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    color: "",
    mileage: 0,
    transmission: "MANUAL",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 50,
    description: "",
    agencyId: ""
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchCars()
    fetchAgencies()
  }, [])

  useEffect(() => {
    fetchCars()
  }, [statusFilter, agencyFilter])

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      window.location.href = "/admin"
    }
  }

  const fetchCars = async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      let url = "/api/admin/cars?"
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (agencyFilter) params.append("agencyId", agencyFilter)
      url += params.toString()

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCars(data.cars || [])
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        window.location.href = "/admin"
      } else {
        setError("Failed to load cars")
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
      setError("Failed to load cars")
    } finally {
      setLoading(false)
    }
  }

  const fetchAgencies = async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      const response = await fetch("/api/admin/agencies", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAgencies(data.agencies || [])
      }
    } catch (error) {
      console.error("Error fetching agencies:", error)
    }
  }

  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      const response = await fetch("/api/admin/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({
          make: "",
          model: "",
          year: new Date().getFullYear(),
          licensePlate: "",
          color: "",
          mileage: 0,
          transmission: "MANUAL",
          fuelType: "GASOLINE",
          seats: 5,
          dailyRate: 50,
          description: "",
          agencyId: ""
        })
        await fetchCars()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create car")
      }
    } catch (error) {
      console.error("Error creating car:", error)
      setError("Failed to create car")
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/admin"
  }

  const filteredCars = cars.filter(car =>
    (car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
     car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
     car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
     car.agency.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500"
      case "RENTED": return "bg-blue-500"
      case "MAINTENANCE": return "bg-yellow-500"
      case "UNAVAILABLE": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading cars...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Management</h1>
            <p className="text-gray-600">Manage your vehicle fleet and inventory</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCar} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate *</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                      placeholder="e.g., ABC123"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., Blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                        <SelectItem value="SEMI_AUTOMATIC">Semi-Automatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GASOLINE">Gasoline</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats">Seats *</Label>
                    <Select value={formData.seats.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, seats: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Daily Rate ($) *</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      step="0.01"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) }))}
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="agencyId">Agency *</Label>
                    <Select value={formData.agencyId} onValueChange={(value) => setFormData(prev => ({ ...prev, agencyId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agency" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name} - {agency.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Car description and features..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Adding Car..." : "Add Car"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                    placeholder="Search cars by make, model, license plate, or agency..."
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
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="RENTED">Rented</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Agencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Agencies</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CarIcon className="h-5 w-5 mr-2" />
              Cars ({filteredCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCars.length > 0 ? (
              <div className="space-y-4">
                {filteredCars.map((car) => (
                  <div key={car.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CarIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {car.make} {car.model}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                          <span>{car.year}</span>
                          <span>•</span>
                          <span>{car.color || "Standard Color"}</span>
                          <span>•</span>
                          <span className="font-medium">{car.licensePlate}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <SettingsIcon className="h-3 w-3 mr-1" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center">
                            <FuelIcon className="h-3 w-3 mr-1" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            <span>{car.seats} seats</span>
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            <span>{car.agency.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>Added {format(new Date(car.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-3 w-3 mr-1" />
                            <span>{car._count.reviews} reviews</span>
                          </div>
                          <div className="flex items-center">
                            <CarIcon className="h-3 w-3 mr-1" />
                            <span>{car._count.bookings} bookings</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-lg font-bold text-blue-600">${car.dailyRate}</p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                      <Badge className={getStatusColor(car.status)}>
                        {car.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter || agencyFilter 
                    ? "Try adjusting your filters." 
                    : "Get started by adding your first car to the fleet."
                  }
                </p>
                {!searchTerm && !statusFilter && !agencyFilter && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Car
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}