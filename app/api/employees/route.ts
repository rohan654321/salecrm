import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface EmployeeWithOptionalDepartment {
  id: string
  name: string
  email: string
  role: string
  departmentId: string | null
  department: {
    id: string
    name: string
  } | null
}

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
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
        name: "asc",
      },
    })

    // Type assertion to handle potential null departments
    const typedEmployees = employees as EmployeeWithOptionalDepartment[]

    return NextResponse.json(typedEmployees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}