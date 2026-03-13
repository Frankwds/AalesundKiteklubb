'use server'

import { createClient } from '@/lib/supabase/server'
import { log, logError } from '@/lib/logger'

export async function sendMessage(courseId: string, content: string) {
  if (!content || content.trim().length === 0) {
    return { success: false as const, error: 'Meldingen kan ikke være tom' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { error } = await supabase.from('messages').insert({
    course_id: courseId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) {
    logError('sendMessage', error)
    return { success: false as const, error: 'Kunne ikke sende melding' }
  }

  log('sendMessage', `message sent to course ${courseId} by user ${user.id}`)

  return { success: true as const }
}
