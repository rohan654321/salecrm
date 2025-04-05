export interface Employee {
  id: string
  name: string
  email: string
  role: string
  departmentId: string
  department?: {
    id: string
    name: string
  }
}

export interface LeadDetail {
  id: string
  name: string
  status: string
  createdAt: string
  soldAmount?: number
  employee: {
    id: string
    name: string
    department?: {
      id: string
      name: string
    }
  }
}

export interface DailyLeadStats {
  date: string
  totalLeads: number
  leads: LeadDetail[]
  statuses: {
    HOT: number
    COLD: number
    WARM: number
    SOLD: number
    CALL_BACK: number
  }
  totalSoldAmount: number
}

export interface DateRangeType {
  from: Date
  to: Date
}

export interface EmployeePerformance {
  id: string
  name: string
  email: string
  role: string
  department?: { id: string; name: string } | null
  totalLeads: number
  lastLeadDate: string | null
  status: "green" | "yellow" | "red"
}

