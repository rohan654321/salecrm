"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { EmployeePerformance } from "./lead-tracker/type"

interface EmployeePerformanceTableProps {
  data: EmployeePerformance[]
  isLoading: boolean
  selectedEmployeeId?: string
}

const getStatusBadge = (status: "green" | "yellow" | "red") => {
  switch (status) {
    case "green":
      return <Badge className="bg-green-500">Active</Badge>
    case "yellow":
      return <Badge className="bg-yellow-500">Warning</Badge>
    case "red":
      return <Badge className="bg-red-500">Inactive</Badge>
    default:
      return <Badge>Unknown</Badge>
  }
}

export default function EmployeePerformanceTable({
  data,
  isLoading,
  selectedEmployeeId,
}: EmployeePerformanceTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">Loading employee performance data...</CardContent>
      </Card>
    )
  }

  // Make sure data is an array before filtering
  const safeData = Array.isArray(data) ? data : []

  const filteredData =
    selectedEmployeeId && selectedEmployeeId !== "all"
      ? safeData.filter((emp) => emp.id === selectedEmployeeId)
      : safeData

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          No employee performance data available for the selected filters.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Lead Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Total Leads</TableHead>
              <TableHead>Last Lead Added</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.department?.name || "Not Assigned"}</TableCell>
                <TableCell>{employee.totalLeads}</TableCell>
                <TableCell>
                  {employee.lastLeadDate ? new Date(employee.lastLeadDate).toLocaleDateString() : "No leads added"}
                </TableCell>
                <TableCell>{getStatusBadge(employee.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

