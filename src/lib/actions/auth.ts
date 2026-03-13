'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { log, logError } from '@/lib/logger'

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    logError('signOut', error)
  }

  redirect('/')
}

export async function deleteAccount() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) {
    logError('deleteAccount', error)
    return { success: false as const, error: 'Kunne ikke slette konto' }
  }

  log('deleteAccount', `user ${user.id} deleted`)

  redirect('/')
}
