'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateInstructorProfileSchema } from '@/lib/validations/instructors'
import { log, logError } from '@/lib/logger'

export async function promoteToInstructor(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('promote_to_instructor', {
    p_user_id: userId,
  })

  if (error) {
    logError('promoteToInstructor', error)
    return { success: false as const, error: error.message }
  }

  log('promoteToInstructor', `user ${userId} promoted to instructor`)

  revalidatePath('/admin')

  return { success: true as const }
}

export async function promoteToAdmin(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('promote_to_admin', {
    p_user_id: userId,
  })

  if (error) {
    logError('promoteToAdmin', error)
    return { success: false as const, error: error.message }
  }

  log('promoteToAdmin', `user ${userId} promoted to admin`)

  revalidatePath('/admin')

  return { success: true as const }
}

export async function demoteToUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('demote_to_user', {
    p_user_id: userId,
  })

  if (error) {
    logError('demoteToUser', error)
    return { success: false as const, error: error.message }
  }

  log('demoteToUser', `user ${userId} demoted to user`)

  revalidatePath('/admin')

  return { success: true as const }
}

export async function demoteAdminToInstructor(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('demote_admin_to_instructor', {
    p_user_id: userId,
  })

  if (error) {
    logError('demoteAdminToInstructor', error)
    return { success: false as const, error: error.message }
  }

  log('demoteAdminToInstructor', `user ${userId} demoted to instructor`)

  revalidatePath('/admin')

  return { success: true as const }
}

export async function updateInstructorProfile(formData: FormData) {
  const parsed = updateInstructorProfileSchema.safeParse({
    bio: formData.get('bio') || undefined,
    certifications: formData.get('certifications') || undefined,
    yearsExperience: formData.get('yearsExperience') || undefined,
    phone: formData.get('phone') || undefined,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const updateData: Record<string, unknown> = {
    bio: parsed.data.bio ?? null,
    certifications: parsed.data.certifications ?? null,
    years_experience: parsed.data.yearsExperience ?? null,
    phone: parsed.data.phone ?? null,
  }

  const photo = formData.get('photo') as File | null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop()
    const filename = `photo.${ext}`
    const storagePath = `${user.id}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('instructor-photos')
      .upload(storagePath, photo, { upsert: true })

    if (uploadError) {
      logError('updateInstructorProfile', uploadError)
      return { success: false as const, error: 'Kunne ikke laste opp bilde' }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('instructor-photos').getPublicUrl(storagePath)

    updateData.photo_url = publicUrl
  }

  const { error } = await supabase
    .from('instructors')
    .update(updateData)
    .eq('user_id', user.id)

  if (error) {
    logError('updateInstructorProfile', error)
    return { success: false as const, error: 'Kunne ikke oppdatere profil' }
  }

  log('updateInstructorProfile', `instructor profile updated for user ${user.id}`)

  revalidatePath('/instructor')
  revalidatePath('/courses')

  return { success: true as const }
}
