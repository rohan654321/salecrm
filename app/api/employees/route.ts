import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { Employee } from "@/app/api/employees/type"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const allEmployees = await prisma.employee.findMany({
      include: {
        department: true,
      },
      orderBy: {
        name: "asc",
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
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const employee = await prisma.employee.create({
      data: json,
    })
    return new NextResponse(JSON.stringify(employee), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

