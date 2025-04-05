"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { DailyLeadStats } from "./type"

interface LeadChartProps {
  data: DailyLeadStats[]
}

export default function LeadChart({ data }: LeadChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">No lead data available for the selected period.</CardContent>
      </Card>
    )
  }

  const chartData = data.map((day) => ({
    date: day.date,
    Hot: day.statuses.HOT,
    Warm: day.statuses.WARM,
    Cold: day.statuses.COLD,
    Sold: day.statuses.SOLD,
    CallBack: day.statuses.CALL_BACK,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Status Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Hot" stackId="a" fill="#EF4444" />
            <Bar dataKey="Warm" stackId="a" fill="#F97316" />
            <Bar dataKey="Cold" stackId="a" fill="#3B82F6" />
            <Bar dataKey="Sold" stackId="a" fill="#10B981" />
            <Bar dataKey="CallBack" stackId="a" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

