"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { DailyLeadStats, LeadDetail } from "./type"

interface LeadTableProps {
  data: DailyLeadStats[]
}

export default function LeadTable({ data }: LeadTableProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a day
  const toggleDay = (date: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "HOT":
        return "bg-red-500"
      case "WARM":
        return "bg-orange-500"
      case "COLD":
        return "bg-blue-500"
      case "SOLD":
        return "bg-green-500"
      case "CALL_BACK":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">No lead data available for the selected period.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Lead Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Total Leads</TableHead>
              <TableHead>Hot</TableHead>
              <TableHead>Warm</TableHead>
              <TableHead>Cold</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Call Back</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((day) => (
              <React.Fragment key={day.date}>
                <TableRow>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell>{day.totalLeads}</TableCell>
                  <TableCell>{day.statuses.HOT}</TableCell>
                  <TableCell>{day.statuses.WARM}</TableCell>
                  <TableCell>{day.statuses.COLD}</TableCell>
                  <TableCell>{day.statuses.SOLD}</TableCell>
                  <TableCell>{day.statuses.CALL_BACK}</TableCell>
                  <TableCell className="text-right">${day.totalSoldAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleDay(day.date)} className="h-8 w-8 p-0">
                      {expandedDays[day.date] ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedDays[day.date] && (
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={9} className="p-0">
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">Lead Details</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Lead Name</TableHead>
                              <TableHead>Employee</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.leads.map((lead: LeadDetail) => (
                              <TableRow key={lead.id}>
                                <TableCell>{lead.name}</TableCell>
                                <TableCell>{lead.employee.name}</TableCell>
                                <TableCell>{lead.employee.department?.name || "Not Assigned"}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(lead.status)}>{lead.status.replace("_", " ")}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {lead.status === "SOLD" && lead.soldAmount
                                    ? `$${lead.soldAmount.toLocaleString()}`
                                    : "-"}
                                </TableCell>
                                <TableCell>{new Date(lead.createdAt).toLocaleTimeString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

