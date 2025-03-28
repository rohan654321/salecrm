import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient, LeadStatus,  } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // Enable Prisma query logging for debugging
});

export async function POST(request: NextRequest) {
  try {
    const leads = await request.json().catch(() => null);

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ message: "Invalid or empty data" }, { status: 400 });
    }

    // Prisma transaction needs Prisma queries, not async functions
    const transactions = leads.map((lead) => {
      if (!lead || typeof lead !== "object") {
        throw new Error("Invalid lead data received");
      }

      const {
        name,
        email,
        company,
        phone,
        city,
        designaction,
        message,
        status,
        callBackTime,
        employeeId,
      } = lead;

      const validStatus: LeadStatus = Object.values(LeadStatus).includes(status)
        ? (status as LeadStatus)
        : LeadStatus.COLD;

      return prisma.lead.create({
        data: {
          name: name ?? null,
          email: email ?? null,
          company: company ?? null,
          phone: phone ?? null,
          city: city ?? null,
          designaction: designaction ?? null,
          message: message ?? null,
          status: validStatus,
          callBackTime: callBackTime ? new Date(callBackTime) : null,
          ...(employeeId && { employee: { connect: { id: employeeId } } }),
        },
      });
    });

    const createdLeads = await prisma.$transaction(transactions); // Correct usage

    return NextResponse.json(
      { message: "Leads imported successfully", count: createdLeads.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error importing leads:", error);
    return NextResponse.json(
      { message: "Error importing leads", error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
