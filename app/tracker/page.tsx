"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, differenceInDays } from "date-fns"
import { CalendarIcon, ListIcon, UsersIcon, XIcon } from "lucide-react"
import LeadTable from "./lead-tracker/lead-table"
import EmployeePerformanceTable from "./employeePerformence"
import type { DailyLeadStats, Employee, EmployeePerformance } from "./lead-tracker/type"

export default function LeadTracker() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [leadStats, setLeadStats] = useState<DailyLeadStats[]>([])
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("performance")

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees")
        if (response.ok) {
          const data = await response.json()
          setEmployees(data)

          // Extract unique departments
          const uniqueDepartments = new Map<string, { id: string; name: string }>()
          data.forEach((employee: Employee) => {
            if (employee.department && !uniqueDepartments.has(employee.department.id)) {
              uniqueDepartments.set(employee.department.id, {
                id: employee.department.id,
                name: employee.department.name,
              })
            }
          })
          setDepartments(Array.from(uniqueDepartments.values()))
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    fetchEmployees()
  }, [])

  // Filter employees by department
  const filteredEmployees =
    selectedDepartment === "all" ? employees : employees.filter((emp) => emp.department?.id === selectedDepartment)

  // Fetch lead statistics
  useEffect(() => {
    const fetchLeadStats = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()

        if (selectedEmployee && selectedEmployee !== "all") {
          params.append("employeeId", selectedEmployee)
        }

        if (selectedDate) {
          // Format the selected date for the API - use the same date for both start and end
          // to get only that specific day's data
          const formattedDate = selectedDate.toISOString().split("T")[0]
          params.append("startDate", formattedDate)
          params.append("endDate", formattedDate)
        } else {
          // If no date is selected, don't add date parameters to fetch all data
          // The API will return all leads without date filtering
        }

        if (selectedDepartment && selectedDepartment !== "all") {
          params.append("departmentId", selectedDepartment)
        }

        const response = await fetch(`/api/lead-stats?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          setLeadStats(data)

          // Get the current filtered employees based on department
          const currentFilteredEmployees =
            selectedDepartment === "all"
              ? employees
              : employees.filter((emp) => emp.department?.id === selectedDepartment)

          // Process employee performance data
          if (currentFilteredEmployees.length > 0) {
            calculateEmployeePerformance(data, currentFilteredEmployees)
          }
        }
      } catch (error) {
        console.error("Error fetching lead statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if employees are loaded
    if (employees.length > 0) {
      fetchLeadStats()
    }
  }, [selectedEmployee, selectedDepartment, selectedDate, employees])

  // Calculate employee performance metrics
  const calculateEmployeePerformance = (leadData: DailyLeadStats[], employeeList: Employee[]) => {
    const today = new Date()
    const employeeMap = new Map<string, EmployeePerformance>()

    // Initialize all employees with zero leads
    employeeList.forEach((emp) => {
      employeeMap.set(emp.id, {
        id: emp.id,
        name: emp.name,
        totalLeads: 0,
        lastLeadDate: null,
        status: "red",
        department: emp.department ? { id: emp.department.id, name: emp.department.name } : null,
        email: emp.email || "",
        role: emp.role || "",
      })
    })

    // Process lead data to update employee stats
    if (leadData && leadData.length > 0) {
      leadData.forEach((day) => {
        if (day.leads && day.leads.length > 0) {
          day.leads.forEach((lead) => {
            const empId = lead.employee.id
            const emp = employeeMap.get(empId)

            if (emp) {
              // Update total leads
              emp.totalLeads += 1

              // Update last lead date if newer
              const leadDate = new Date(lead.createdAt)
              if (!emp.lastLeadDate || leadDate > new Date(emp.lastLeadDate)) {
                emp.lastLeadDate = lead.createdAt
              }
            }
          })
        }
      })
    }

    // Determine status based on last lead date
    employeeMap.forEach((emp) => {
      if (emp.lastLeadDate) {
        const daysSinceLastLead = differenceInDays(today, new Date(emp.lastLeadDate))

        if (daysSinceLastLead <= 1) {
          emp.status = "green" // Active - added leads today or yesterday
        } else if (daysSinceLastLead <= 3) {
          emp.status = "yellow" // Warning - no leads in 2-3 days
        } else {
          emp.status = "red" // Inactive - no leads in more than 3 days
        }
      } else {
        emp.status = "red" // No leads ever added
      }
    })

    setEmployeePerformance(Array.from(employeeMap.values()))
  }

  // Reset employee selection when department changes
  useEffect(() => {
    setSelectedEmployee("all")
  }, [selectedDepartment])

  // Format date for display
  const formatDate = () => {
    if (selectedDate) {
      return format(selectedDate, "PPP")
    }
    return "All dates"
  }

  // Clear date selection
  const clearDateSelection = () => {
    setSelectedDate(undefined)
  }

  const NoDataMessage = () => (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {selectedDate
            ? `No leads were added on ${format(selectedDate, "MMMM d, yyyy")}.`
            : "No leads found for the selected filters."}
        </p>
      </CardContent>
    </Card>
  )

  const hasDataForSelectedFilters = () => {
    return leadStats.length > 0
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Employee Lead Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Leads</CardTitle>
            <CardDescription>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "All time"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hasDataForSelectedFilters() ? leadStats.reduce((sum, day) => sum + day.totalLeads, 0) : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Sold Leads</CardTitle>
            <CardDescription>Converted to sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hasDataForSelectedFilters() ? leadStats.reduce((sum, day) => sum + day.statuses.SOLD, 0) : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From sold leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {hasDataForSelectedFilters()
                ? leadStats.reduce((sum, day) => sum + day.totalSoldAmount, 0).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Department Filter */}
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employee Filter */}
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {filteredEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Picker with Clear Button */}
        <div className="relative w-full md:w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={clearDateSelection}
              aria-label="Clear date selection"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="performance" className="flex items-center">
            <UsersIcon className="mr-2 h-4 w-4" />
            Employee Performance
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center">
            <ListIcon className="mr-2 h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">Loading performance data...</div>
          ) : !hasDataForSelectedFilters() ? (
            <NoDataMessage />
          ) : (
            <EmployeePerformanceTable
              data={employeePerformance}
              isLoading={isLoading}
              selectedEmployeeId={selectedEmployee}
            />
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">Loading table data...</div>
          ) : !hasDataForSelectedFilters() ? (
            <NoDataMessage />
          ) : (
            <LeadTable data={leadStats} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
