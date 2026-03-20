'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSpotSchema, updateSpotSchema } from '@/lib/validations/spots'
import { parseKiteZonesField } from '@/lib/validations/kite-zones'
import { log, logError } from '@/lib/logger'

export async function createSpot(formData: FormData) {
  const windDirections = formData.getAll('windDirections') as string[]
  const waterType = formData.getAll('waterType') as string[]

  const parsed = createSpotSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    area: formData.get('area'),
    season: formData.get('season') || undefined,
    skillLevel: formData.get('skillLevel') || undefined,
    skillNotes: formData.get('skillNotes') || undefined,
    latitude: formData.get('latitude') || undefined,
    longitude: formData.get('longitude') || undefined,
    windDirections: windDirections.length > 0 ? windDirections : undefined,
    waterType: waterType.length > 0 ? waterType : undefined,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const kiteZonesResult = parseKiteZonesField(formData.get('kite_zones'))
  if (!kiteZonesResult.success) {
    return { success: false as const, error: kiteZonesResult.error }
  }

  const kiteZonesPayload =
    kiteZonesResult.data &&
    kiteZonesResult.data.features &&
    kiteZonesResult.data.features.length > 0
      ? kiteZonesResult.data
      : null

  const supabase = await createClient()

  const { data: spot, error: insertError } = await supabase
    .from('spots')
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      area: parsed.data.area,
      season: parsed.data.season,
      skill_level: parsed.data.skillLevel,
      skill_notes: parsed.data.skillNotes,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      wind_directions: parsed.data.windDirections,
      water_type: parsed.data.waterType,
      kite_zones: kiteZonesPayload,
    })
    .select()
    .single()

  if (insertError || !spot) {
    logError('createSpot', insertError || new Error('Insert returned no data'))
    return { success: false as const, error: 'Kunne ikke opprette spot' }
  }

  const image = formData.get('image') as File | null
  if (image && image.size > 0) {
    const ext = image.name.split('.').pop()
    const storagePath = `${spot.id}/map.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('spot-maps')
      .upload(storagePath, image)

    if (uploadError) {
      logError('createSpot', uploadError)
      await supabase.from('spots').delete().eq('id', spot.id)
      return { success: false as const, error: 'Kunne ikke laste opp kart — spot ble ikke opprettet' }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('spot-maps').getPublicUrl(storagePath)

    const { error: updateError } = await supabase
      .from('spots')
      .update({ map_image_url: publicUrl })
      .eq('id', spot.id)

    if (updateError) {
      logError('createSpot', updateError)
    }
  }

  log('createSpot', `spot ${spot.id} created`)

  revalidatePath('/spots')
  revalidatePath('/admin')

  return { success: true as const, spot }
}

export async function updateSpot(formData: FormData) {
  const windDirections = formData.getAll('windDirections') as string[]
  const waterType = formData.getAll('waterType') as string[]

  const parsed = updateSpotSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    area: formData.get('area') || undefined,
    season: formData.get('season') || undefined,
    skillLevel: formData.get('skillLevel') || undefined,
    skillNotes: formData.get('skillNotes') || undefined,
    latitude: formData.get('latitude') || undefined,
    longitude: formData.get('longitude') || undefined,
    windDirections: windDirections.length > 0 ? windDirections : undefined,
    waterType: waterType.length > 0 ? waterType : undefined,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const kiteZonesResult = parseKiteZonesField(formData.get('kite_zones'))
  if (!kiteZonesResult.success) {
    return { success: false as const, error: kiteZonesResult.error }
  }

  const supabase = await createClient()
  const { id, ...fields } = parsed.data

  const updateData: Record<string, unknown> = {}
  if (fields.name !== undefined) updateData.name = fields.name
  if (fields.description !== undefined) updateData.description = fields.description
  if (fields.area !== undefined) updateData.area = fields.area
  if (fields.season !== undefined) updateData.season = fields.season
  if (fields.skillLevel !== undefined) updateData.skill_level = fields.skillLevel
  if (fields.skillNotes !== undefined) updateData.skill_notes = fields.skillNotes
  if (fields.latitude !== undefined) updateData.latitude = fields.latitude
  if (fields.longitude !== undefined) updateData.longitude = fields.longitude
  if (fields.windDirections !== undefined) updateData.wind_directions = fields.windDirections
  if (fields.waterType !== undefined) updateData.water_type = fields.waterType

  const kiteZonesPayload =
    kiteZonesResult.data &&
    kiteZonesResult.data.features &&
    kiteZonesResult.data.features.length > 0
      ? kiteZonesResult.data
      : null
  updateData.kite_zones = kiteZonesPayload

  if (formData.get('removeImage') === 'true') {
    updateData.map_image_url = null
    const { data: files } = await supabase.storage
      .from('spot-maps')
      .list(id, { limit: 10 })
    const mapFile = files?.find((f) => f.name.startsWith('map.'))
    if (mapFile) {
      await supabase.storage.from('spot-maps').remove([`${id}/${mapFile.name}`])
    }
  } else {
    const image = formData.get('image') as File | null
    if (image && image.size > 0) {
    const ext = image.name.split('.').pop()
    const storagePath = `${id}/map.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('spot-maps')
      .upload(storagePath, image, { upsert: true })

    if (uploadError) {
      logError('updateSpot', uploadError)
      return { success: false as const, error: 'Kunne ikke laste opp kart' }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('spot-maps').getPublicUrl(storagePath)

    updateData.map_image_url = publicUrl
  }
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('spots')
      .update(updateData)
      .eq('id', id)

    if (error) {
      logError('updateSpot', error)
      return { success: false as const, error: 'Kunne ikke oppdatere spot' }
    }
  }

  log('updateSpot', `spot ${id} updated`)

  revalidatePath('/spots')
  revalidatePath('/admin')

  return { success: true as const }
}

export async function deleteSpot(spotId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('spots').delete().eq('id', spotId)

  if (error) {
    logError('deleteSpot', error)
    return { success: false as const, error: 'Kunne ikke slette spot' }
  }

  log('deleteSpot', `spot ${spotId} deleted`)

  revalidatePath('/spots')
  revalidatePath('/admin')

  return { success: true as const }
}
