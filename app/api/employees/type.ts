export type Employee = {
    id: string
    name: string
    email: string
    role: string
    departmentId: string
    department: {
      id: string
      name: string
    } | null
  }
  
  