"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MapPinIcon, 
  PlusIcon, 
  SearchIcon, 
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  CarIcon,
  EditIcon,
  TrashIcon,
  LogOutIcon,
  SettingsIcon,
  GlobeIcon
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Agency {
  id: string
  name: string
  address: string
  city: string
  country: string
  phone?: string
  email?: string
  latitude?: number
  longitude?: number
  createdAt: string
  _count: {
    cars: number
  }
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Form state for creating agency
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: ""
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchAgencies()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      window.location.href = "/admin"
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
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        window.location.href = "/admin"
      } else {
        setError("Failed to load agencies")
      }
    } catch (error) {
      console.error("Error fetching agencies:", error)
      setError("Failed to load agencies")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    const token = localStorage.getItem("adminToken")
    if (!token) return

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      }

      const response = await fetch("/api/admin/agencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({
          name: "",
          address: "",
          city: "",
          country: "",
          phone: "",
          email: "",
          latitude: "",
          longitude: ""
        })
        await fetchAgencies()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create agency")
      }
    } catch (error) {
      console.error("Error creating agency:", error)
      setError("Failed to create agency")
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/admin"
  }

  const filteredAgencies = agencies.filter(agency =>
    (agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     agency.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
     agency.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
     agency.address.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading agencies...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Management</h1>
            <p className="text-gray-600">Manage rental locations and agencies</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Agency
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Agency</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAgency} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter agency name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Enter country"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="e.g., 36.8065"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="e.g., 10.1815"
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
                    {creating ? "Creating..." : "Create Agency"}
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

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agencies by name, city, country, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agencies List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Agencies ({filteredAgencies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAgencies.length > 0 ? (
              <div className="space-y-4">
                {filteredAgencies.map((agency) => (
                  <div key={agency.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {agency.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                          <div className="flex items-center">
                            <GlobeIcon className="h-3 w-3 mr-1" />
                            <span>{agency.city}, {agency.country}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {agency.address}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {agency.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              <span>{agency.phone}</span>
                            </div>
                          )}
                          {agency.email && (
                            <div className="flex items-center">
                              <MailIcon className="h-3 w-3 mr-1" />
                              <span>{agency.email}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>Added {format(new Date(agency.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center">
                            <CarIcon className="h-3 w-3 mr-1" />
                            <span>{agency._count.cars} cars</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium text-blue-600">{agency._count.cars}</p>
                        <p className="text-xs text-gray-500">vehicles</p>
                      </div>
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
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No agencies found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first rental agency."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Agency
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