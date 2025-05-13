import { LeadStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // <---- import singleton here

// Utility function to chunk array into batches
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const leads = await request.json().catch(() => null);

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ message: "Invalid or empty data" }, { status: 400 });
    }

    const formattedLeads = leads.map((lead) => {
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
        soldAmount,
      } = lead;

      // ---- STATUS HANDLING ----
      let cleanedStatus: LeadStatus = LeadStatus.COLD; // default

      if (typeof status === "string") {
        const trimmedUpperStatus = status.trim().toUpperCase();

        if (Object.values(LeadStatus).includes(trimmedUpperStatus as LeadStatus)) {
          cleanedStatus = trimmedUpperStatus as LeadStatus;
        } else {
          console.warn(`Invalid status "${status}" found, defaulting to COLD`);
        }
      }

      // Convert soldAmount to a valid number if it exists
      let numericSoldAmount: number | null = null;
      if (soldAmount !== undefined && soldAmount !== null) {
        const numericAmount = Number(soldAmount);
        if (!isNaN(numericAmount)) {
          numericSoldAmount = numericAmount;
        }
      }

      const formattedLead = {
        name: name ?? null,
        email: email ?? null,
        company: company ?? null,
        phone: phone ? String(phone) : null,
        city: city ?? null,
        designaction: designaction ?? null,
        message: message ?? null,
        status: cleanedStatus,
        callBackTime: callBackTime ? new Date(callBackTime) : null,
        employeeId: employeeId ?? null,
        soldAmount: numericSoldAmount ?? null,
      };

      return formattedLead;
    });

    console.log(`Preparing to import ${formattedLeads.length} leads`);

    // ---- Batch insert ----
    const BATCH_SIZE = 100; // safer on Vercel
    const chunks = chunkArray(formattedLeads, BATCH_SIZE);

    let totalInserted = 0;

    for (const chunk of chunks) {
      const result = await prisma.lead.createMany({
        data: chunk,
      });
      totalInserted += result.count;
      console.log(`Inserted batch of ${chunk.length} leads — cumulative: ${totalInserted}`);
    }

    return NextResponse.json(
      {
        message: "Leads imported successfully",
        count: totalInserted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error importing leads:", (error as Error).message);
    return NextResponse.json(
      { message: "Error importing leads", error: (error as Error).message },
      { status: 500 }
    );
  }
}
