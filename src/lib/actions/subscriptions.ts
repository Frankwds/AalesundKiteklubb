'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { log, logError } from '@/lib/logger'

export async function subscribe() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    email: user.email!,
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false as const, error: 'Du abonnerer allerede' }
    }
    logError('subscribe', error)
    return { success: false as const, error: 'Kunne ikke abonnere' }
  }

  log('subscribe', `user ${user.id} subscribed`)

  revalidatePath('/courses')

  return { success: true as const }
}

export async function unsubscribe() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    logError('unsubscribe', error)
    return { success: false as const, error: 'Kunne ikke avslutte abonnement' }
  }

  log('unsubscribe', `user ${user.id} unsubscribed`)

  revalidatePath('/courses')

  return { success: true as const }
}
