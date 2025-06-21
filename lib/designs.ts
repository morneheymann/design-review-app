import { supabase } from './supabase'
import { Design, DesignPair, Rating } from './database.types'

export async function uploadDesign(designerId: string, title: string, imageUrl: string, description?: string): Promise<Design> {
  const { data, error } = await supabase
    .from('designs')
    .insert({
      designer_id: designerId,
      title,
      description,
      image_url: imageUrl,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createDesignPair(designerId: string, designAId: string, designBId: string, title: string, description?: string): Promise<DesignPair> {
  const { data, error } = await supabase
    .from('design_pairs')
    .insert({
      designer_id: designerId,
      design_a_id: designAId,
      design_b_id: designBId,
      title,
      description,
      is_active: true
    })
    .select(`
      *,
      design_a:designs!design_a_id(*),
      design_b:designs!design_b_id(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getDesignerDesigns(designerId: string): Promise<Design[]> {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('designer_id', designerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDesignPairsForTester(): Promise<DesignPair[]> {
  const { data, error } = await supabase
    .from('design_pairs')
    .select(`
      *,
      design_a:designs!design_a_id(*),
      design_b:designs!design_b_id(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function submitRating(testerId: string, designPairId: string, chosenDesignId: string, feedback?: string): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .insert({
      tester_id: testerId,
      design_pair_id: designPairId,
      chosen_design_id: chosenDesignId,
      feedback
    })
    .select(`
      *,
      design_pair:design_pairs(*),
      chosen_design:designs(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getDesignerStats(userId: string) {
  try {
    console.log('Getting stats for user:', userId)
    
    // Get user's individual designs
    const { data: designs, error: designsError } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', userId)

    if (designsError) {
      console.error('Error fetching designs:', designsError)
      throw designsError
    }

    // Get user's design pairs
    const { data: pairs, error: pairsError } = await supabase
      .from('design_pairs')
      .select('*')
      .eq('designer_id', userId)

    if (pairsError) {
      console.error('Error fetching design pairs:', pairsError)
      throw pairsError
    }

    // Get ratings for user's design pairs
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .in('design_pair_id', pairs?.map(p => p.id) || [])

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      throw ratingsError
    }

    const stats = {
      totalDesigns: designs?.length || 0,
      totalPairs: pairs?.length || 0,
      totalRatings: ratings?.length || 0
    }

    console.log('Stats calculated:', stats)
    return stats
  } catch (error) {
    console.error('Error in getDesignerStats:', error)
    return {
      totalDesigns: 0,
      totalPairs: 0,
      totalRatings: 0
    }
  }
}

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}

export async function createDesign(data: {
  title: string
  description: string
  imageFile1: File
  imageFile2: File
}): Promise<DesignPair> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('You must be logged in to upload designs')
  }

  // Check if user exists in our users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching user profile:', profileError)
    throw new Error('Failed to verify user profile')
  }

  // If user doesn't exist in our table, create them (this can happen if they registered before we set up the trigger)
  if (!userProfile) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0],
        user_type: user.user_metadata?.user_type || 'tester'
      })

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      // Continue anyway, the upload might still work
    }
  }

  // Upload first image to Supabase Storage
  const fileName1 = `${Date.now()}-1-${data.imageFile1.name}`
  const { data: uploadData1, error: uploadError1 } = await supabase.storage
    .from('designs')
    .upload(fileName1, data.imageFile1)

  if (uploadError1) {
    console.error('Upload error for image 1:', uploadError1)
    throw new Error(`Failed to upload first image: ${uploadError1.message}`)
  }

  // Upload second image to Supabase Storage
  const fileName2 = `${Date.now()}-2-${data.imageFile2.name}`
  const { data: uploadData2, error: uploadError2 } = await supabase.storage
    .from('designs')
    .upload(fileName2, data.imageFile2)

  if (uploadError2) {
    console.error('Upload error for image 2:', uploadError2)
    throw new Error(`Failed to upload second image: ${uploadError2.message}`)
  }

  // Get the public URLs for the uploaded images
  const { data: urlData1 } = supabase.storage
    .from('designs')
    .getPublicUrl(fileName1)

  const { data: urlData2 } = supabase.storage
    .from('designs')
    .getPublicUrl(fileName2)

  // Create first design record
  const { data: design1, error: designError1 } = await supabase
    .from('designs')
    .insert({
      title: `${data.title} - Variation A`,
      description: data.description,
      image_url: urlData1.publicUrl,
      designer_id: user.id
    })
    .select()
    .single()

  if (designError1) {
    console.error('Error creating first design:', designError1)
    throw new Error(`Failed to create first design: ${designError1.message}`)
  }

  // Create second design record
  const { data: design2, error: designError2 } = await supabase
    .from('designs')
    .insert({
      title: `${data.title} - Variation B`,
      description: data.description,
      image_url: urlData2.publicUrl,
      designer_id: user.id
    })
    .select()
    .single()

  if (designError2) {
    console.error('Error creating second design:', designError2)
    throw new Error(`Failed to create second design: ${designError2.message}`)
  }

  // Create design pair
  const { data: designPair, error: pairError } = await supabase
    .from('design_pairs')
    .insert({
      designer_id: user.id,
      design_a_id: design1.id,
      design_b_id: design2.id,
      title: data.title,
      description: data.description
    })
    .select(`
      *,
      design_a:designs!design_a_id(*),
      design_b:designs!design_b_id(*)
    `)
    .single()

  if (pairError) {
    console.error('Error creating design pair:', pairError)
    throw new Error(`Failed to create design pair: ${pairError.message}`)
  }

  return designPair
}

export async function getDesigns(): Promise<Design[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from('designs')
    .select(`
      *,
      designer:users(name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching designs:', error)
    return []
  }

  return data || []
}

export async function getDesignById(id: string): Promise<Design | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from('designs')
    .select(`
      *,
      designer:users(name, email)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching design:', error)
    return null
  }

  return data
}

export async function getUserDesigns(userId: string): Promise<Design[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user designs:', error)
    return []
  }

  return data || []
}

export async function getUserDesignPairs(userId: string): Promise<DesignPair[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from('design_pairs')
    .select(`
      *,
      design_a:designs!design_a_id(*),
      design_b:designs!design_b_id(*)
    `)
    .eq('designer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user design pairs:', error)
    return []
  }

  return data || []
}

export async function getDesignPairById(id: string): Promise<DesignPair | null> {
  console.log('getDesignPairById: Called with ID:', id)
  
  if (!isSupabaseConfigured()) {
    console.log('getDesignPairById: Supabase not configured')
    return null
  }

  console.log('getDesignPairById: Querying Supabase for design pair...')
  
  try {
    // Use a single query with joins to get all the data at once
    const { data: designPair, error } = await supabase
      .from('design_pairs')
      .select(`
        *,
        design_a:designs!design_a_id(*),
        design_b:designs!design_b_id(*),
        ratings(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('getDesignPairById: Error fetching design pair:', error)
      return null
    }

    if (!designPair) {
      console.log('getDesignPairById: No design pair found')
      return null
    }

    console.log('getDesignPairById: Successfully fetched design pair:', designPair)
    return designPair
  } catch (error) {
    console.error('getDesignPairById: Unexpected error:', error)
    return null
  }
} 