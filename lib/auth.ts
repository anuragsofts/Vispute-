/**
 * Auth helper: get current user + staff role from server.
 * Returns null if not authenticated or not staff.
 */

import { createClient } from '@/lib/supabase/server'
import type { StaffRole } from '@/lib/supabase/types'

export interface AuthUser {
  id: string
  email: string | undefined
  role: StaffRole
  name: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('staff')
    .select('role, name')
    .eq('user_id', user.id)
    .maybeSingle()

  const staffData = data as { role: StaffRole; name: string } | null
  if (!staffData) return null

  return {
    id: user.id,
    email: user.email,
    role: staffData.role,
    name: staffData.name,
  }
}

export async function requireRole(
  ...roles: StaffRole[]
): Promise<AuthUser> {
  const user = await getAuthUser()

  if (!user || !roles.includes(user.role)) {
    throw new Error('Unauthorized')
  }

  return user
}
