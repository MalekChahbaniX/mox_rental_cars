"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CarIcon, FilterIcon, SearchIcon, StarIcon, MapPinIcon } from "lucide-react"
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
    city: string
    country: string
  }
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    transmission: "",
    fuelType: "",
    seats: "",
    sortBy: "price-asc"
  })

  // Client-side effect to handle search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const location = params.get("location")
    if (location) {
      setSearchTerm(location)
    }
  }, [])

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    filterCars()
  }, [cars, searchTerm, filters])

  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars")
      if (response.ok) {
        const data = await response.json()
        setCars(data.cars || [])
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCars = () => {
    if (!Array.isArray(cars)) {
      setFilteredCars([])
      return
    }
    
    let filtered = cars.filter(car => 
      car.status === "AVAILABLE" && 
      (car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
       car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
       car.agency.city.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Apply filters
    if (filters.minPrice) {
      filtered = filtered.filter(car => car.dailyRate >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.dailyRate <= parseFloat(filters.maxPrice))
    }
    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission)
    }
    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filters.fuelType)
    }
    if (filters.seats) {
      filtered = filtered.filter(car => car.seats === parseInt(filters.seats))
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.dailyRate - b.dailyRate)
        break
      case "price-desc":
        filtered.sort((a, b) => b.dailyRate - a.dailyRate)
        break
      case "year-desc":
        filtered.sort((a, b) => b.year - a.year)
        break
      case "mileage-asc":
        filtered.sort((a, b) => a.mileage - b.mileage)
        break
    }

    setFilteredCars(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      transmission: "",
      fuelType: "",
      seats: "",
      sortBy: "price-asc"
    })
    setSearchTerm("")
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Car</h1>
          <p className="text-gray-600">Browse our extensive collection of vehicles</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by make, model, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="year-desc">Year: Newest First</SelectItem>
                  <SelectItem value="mileage-asc">Mileage: Lowest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                <FilterIcon className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div>
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>
            <div>
              <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  <SelectItem value="SEMI_AUTOMATIC">Semi-Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Gasoline</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.seats} onValueChange={(value) => handleFilterChange("seats", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Seats</SelectItem>
                  <SelectItem value="4">4 Seats</SelectItem>
                  <SelectItem value="5">5 Seats</SelectItem>
                  <SelectItem value="7">7 Seats</SelectItem>
                  <SelectItem value="8">8+ Seats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredCars.length} of {cars.length} cars
          </p>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {car.imageUrl ? (
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CarIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-green-500">
                  Available
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-gray-600">{car.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ${car.dailyRate}
                    </p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{car.agency?.city}, {car.agency?.country}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{car.transmission}</Badge>
                  <Badge variant="secondary">{car.fuelType}</Badge>
                  <Badge variant="secondary">{car.seats} seats</Badge>
                  <Badge variant="secondary">{car.mileage.toLocaleString()} km</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">4.5 (24 reviews)</span>
                  </div>
                  <Link href={`/cars/${car.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <CarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}