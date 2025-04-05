import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient, type LeadStatus } from "@prisma/client"

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WhereClause {
  createdAt?: {
    gte?: Date
    lte?: Date
  }
  employeeId?: string | { in: string[] }
  employee?: {
    departmentId?: string
  }
}

interface LeadEmployee {
  id: string
  name: string
  department: {
    id: string
    name: string
  } | null
}

interface Lead {
  id: string
  name: string
  email: string | null
  company: string
  phone: string | null
  city: string
  designaction: string | null
  message: string | null
  status: LeadStatus
  soldAmount: number | null
  callBackTime: Date | null
  employeeId: string
  createdAt: Date
  employee: LeadEmployee
}

interface LeadsByDay {
  date: string
  totalLeads: number
  leads: Lead[]
  statuses: Record<LeadStatus, number>
  totalSoldAmount: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const departmentId = searchParams.get("departmentId")

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {} // Using 'any' temporarily to bypass strict type checking

    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        dateFilter.gte = start
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }

      whereClause.createdAt = dateFilter
    }

    if (employeeId && employeeId !== "all") {
      whereClause.employeeId = employeeId
    }

    let employeeIds: string[] = []
    if (departmentId && departmentId !== "all") {
      const departmentEmployees = await prisma.employee.findMany({
        where: { departmentId },
        select: { id: true },
      })

      employeeIds = departmentEmployees.map((emp) => emp.id)

      if (employeeIds.length === 0) {
        return NextResponse.json([])
      }

      if (employeeId && employeeId !== "all") {
        if (!employeeIds.includes(employeeId)) {
          return NextResponse.json([])
        }
      } else {
        whereClause.employeeId = { in: employeeIds }
      }
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const leadsByDay: Record<string, LeadsByDay> = {}

    leads.forEach((lead) => {
      const day = lead.createdAt.toISOString().split("T")[0]

      if (!leadsByDay[day]) {
        leadsByDay[day] = {
          date: day,
          totalLeads: 0,
          leads: [],
          statuses: {
            HOT: 0,
            COLD: 0,
            WARM: 0,
            SOLD: 0,
            CALL_BACK: 0,
          },
          totalSoldAmount: 0,
        }
      }

      leadsByDay[day].leads.push(lead as Lead)
      leadsByDay[day].totalLeads += 1
      leadsByDay[day].statuses[lead.status] += 1

      if (lead.status === "SOLD" && lead.soldAmount) {
        leadsByDay[day].totalSoldAmount += lead.soldAmount
      }
    })

    const result = Object.values(leadsByDay).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching lead statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}