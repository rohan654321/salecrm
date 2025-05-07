import { LeadStatus, PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

// Define a type for problematic leads
type ProblematicLead = {
  index: number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const leads = await request.json().catch((e) => {
      console.error("Failed to parse JSON:", e)
      return null
    })

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ message: "Invalid or empty data" }, { status: 400 })
    }

    console.log(`Processing ${leads.length} leads...`)

    // Track any problematic leads for reporting
    const problematicLeads: ProblematicLead[] = []
    
    const formattedLeads = leads.map((lead, index) => {
      try {
        if (!lead || typeof lead !== "object") {
          problematicLeads.push({ index, reason: "Not an object" })
          throw new Error(`Invalid lead data at index ${index}`)
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
        } = lead

        // ---- IMPROVED STATUS HANDLING ----
        let cleanedStatus: LeadStatus = LeadStatus.COLD // default

        if (typeof status === "string") {
          if (status === "") {
            // This is fine, just use the default
            console.log(`Lead ${index}: Empty status, using default COLD`)
          } else {
            const trimmedUpperStatus = status.trim().toUpperCase()
            if (Object.values(LeadStatus).includes(trimmedUpperStatus as LeadStatus)) {
              cleanedStatus = trimmedUpperStatus as LeadStatus
            } else {
              console.warn(`Lead ${index}: Invalid status "${status}", using default COLD`)
            }
          }
        } else if (status !== undefined && status !== null) {
          console.warn(`Lead ${index}: Non-string status value: ${typeof status}, using default COLD`)
        }
        // ---- END IMPROVED STATUS HANDLING ----

        // Handle callBackTime carefully
        let parsedCallBackTime = null
        if (callBackTime) {
          try {
            parsedCallBackTime = new Date(callBackTime)
            // Check if date is valid
            if (isNaN(parsedCallBackTime.getTime())) {
              console.warn(`Lead ${index}: Invalid date format for callBackTime: "${callBackTime}", using null`)
              parsedCallBackTime = null
            }
          } catch (error) {
            console.log(error);
            
            // Using underscore to indicate intentionally unused variable
            console.warn(`Lead ${index}: Error parsing callBackTime: "${callBackTime}", using null`)
            parsedCallBackTime = null
          }
        }

        // Create the lead object
        const formattedLead = {
          name: name ?? null,
          email: email ?? null,
          company: company ?? null,
          phone: phone ? String(phone) : null,
          city: city ?? null,
          designaction: designaction ?? null,
          message: message ?? null,
          status: cleanedStatus,
          callBackTime: parsedCallBackTime,
          employeeId: employeeId ?? null,
        }

        return formattedLead
      } catch (error) {
        problematicLeads.push({ index, reason: (error as Error).message })
        console.error(`Error processing lead at index ${index}:`, error)
        // Return a valid lead with minimal data to avoid breaking the whole batch
        return {
          name: `Error Lead ${index}`,
          email: null,
          company: null,
          phone: null,
          city: null,
          designaction: null,
          message: `Error: ${(error as Error).message}`,
          status: LeadStatus.COLD,
          callBackTime: null,
          employeeId: null,
        }
      }
    })

    if (problematicLeads.length > 0) {
      console.warn(`Found ${problematicLeads.length} problematic leads:`, problematicLeads)
    }

    console.log("Attempting to create leads in database...")
    
    try {
      const result = await prisma.lead.createMany({
        data: formattedLeads,
      })

      console.log(`Successfully created ${result.count} leads`)

      return NextResponse.json(
        {
          message: "Leads imported successfully",
          count: result.count,
          problematicLeads: problematicLeads.length > 0 ? problematicLeads : undefined,
        },
        { status: 200 },
      )
    } catch (prismaError) {
      // Log the detailed Prisma error
      console.error("Prisma error during createMany:", prismaError)
      
      // Try to identify if there's a specific lead causing the issue
      if (formattedLeads.length > 1) {
        console.log("Attempting to identify problematic lead by creating one at a time...")
        
        const results = []
        for (let i = 0; i < formattedLeads.length; i++) {
          try {
            await prisma.lead.create({
              data: formattedLeads[i]
            })
            results.push({ index: i, success: true })
          } catch (e) {
            results.push({ index: i, success: false, error: (e as Error).message })
            console.error(`Failed to create lead at index ${i}:`, e)
          }
        }
        
        const failedLeads = results.filter(r => !r.success)
        console.log(`Individual creation results: ${results.filter(r => r.success).length} succeeded, ${failedLeads.length} failed`)
        
        return NextResponse.json({ 
          message: "Batch import failed, some leads were imported individually",
          individualResults: results,
          failedLeads
        }, { status: 500 })
      }
      
      throw prismaError // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Error importing leads:", error)
    return NextResponse.json({ 
      message: "Error importing leads", 
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}