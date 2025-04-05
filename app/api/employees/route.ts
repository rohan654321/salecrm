import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
  email: string
  role: string
  departmentId: string | null
  department?: Department | null
}

export async function GET() {
  try {
    // Get all employees in a single query with optional department
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Transform the result to match our interface
    const transformedEmployees: Employee[] = allEmployees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      departmentId: employee.departmentId,
      department: employee.department ? {
        id: employee.department.id,
        name: employee.department.name
      } : null
    }))

    return NextResponse.json(transformedEmployees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}