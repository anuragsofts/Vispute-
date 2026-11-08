import { cookies } from 'next/headers'

export type StaffRole = 'admin' | 'cashier' | 'waiter' | 'kitchen'

export interface AuthStaff {
  role: StaffRole
  name: string
}

export async function getAuthStaff(): Promise<AuthStaff | null> {
  const cookieStore = await cookies()
  const role = cookieStore.get('vispute_role')?.value as StaffRole | undefined
  const name = cookieStore.get('vispute_staff_name')?.value || 'कर्मचारी'

  if (!role || !['admin', 'cashier', 'waiter', 'kitchen'].includes(role)) {
    return null
  }

  return { role, name }
}

export async function requireStaffRole(...allowedRoles: StaffRole[]): Promise<AuthStaff> {
  const staff = await getAuthStaff()
  if (!staff || !allowedRoles.includes(staff.role)) {
    throw new Error('Unauthorized')
  }
  return staff
}
