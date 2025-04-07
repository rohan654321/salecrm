import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // First, get all employees without including departments
    const allEmployees = await prisma.employee.findMany({
      orderBy: {
        name: "asc",
      },
    })

    // Then, for each employee, fetch their department separately if they have one
    const employeesWithDepartments = await Promise.all(
      allEmployees.map(async (employee) => {
        let department = null

        if (employee.departmentId) {
          try {
            department = await prisma.department.findUnique({
              where: { id: employee.departmentId },
              select: { id: true, name: true },
            })
          } catch (error) {
            console.error(`Error fetching department for employee ${employee.id}:`, error)
          }
        }

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          departmentId: employee.departmentId,
          department: department,
        }
      }),
    )

    return NextResponse.json(employeesWithDepartments)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: { json: () => any }) {
  try {
    const json = await request.json()
    const employee = await prisma.employee.create({
      data: json,
    })
    return new NextResponse(JSON.stringify(employee), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

