import { supabase } from './supabase'
import { Review, Comment, ReviewSession, Design } from './database.types'

// Review functions
export async function createReview(designId: string, reviewerId: string, data: {
  rating?: number
  feedback?: string
  status?: Review['status']
}) {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      design_id: designId,
      reviewer_id: reviewerId,
      ...data
    })
    .select('*')
    .single()

  if (error) throw error
  return review
}

export async function getReviewsByDesign(designId: string) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('design_id', designId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return reviews
}

export async function getReviewById(reviewId: string) {
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single()

  if (error) throw error
  return review
}

export async function updateReview(reviewId: string, updates: Partial<Review>) {
  const { data: review, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select('*')
    .single()

  if (error) throw error
  return review
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}

// Comment functions
export async function createComment(reviewId: string, reviewerId: string, data: {
  content: string
  x_position?: number
  y_position?: number
}) {
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      review_id: reviewId,
      reviewer_id: reviewerId,
      ...data
    })
    .select('*')
    .single()

  if (error) throw error
  return comment
}

export async function getCommentsByReview(reviewId: string) {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return comments
}

export async function updateComment(commentId: string, updates: Partial<Comment>) {
  const { data: comment, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', commentId)
    .select('*')
    .single()

  if (error) throw error
  return comment
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

// Review session functions
export async function startReviewSession(designId: string, reviewerId: string) {
  const { data: session, error } = await supabase
    .from('review_sessions')
    .insert({
      design_id: designId,
      reviewer_id: reviewerId
    })
    .select('*')
    .single()

  if (error) throw error
  return session
}

export async function endReviewSession(sessionId: string) {
  const { data: session, error } = await supabase
    .from('review_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_minutes: 0 // You can calculate this based on started_at
    })
    .eq('id', sessionId)
    .select('*')
    .single()

  if (error) throw error
  return session
}

// Design review statistics
export async function getDesignReviewStats(designId: string) {
  const { data: stats, error } = await supabase
    .rpc('get_design_average_rating', { design_uuid: designId })

  if (error) throw error

  const { data: reviewCount, error: countError } = await supabase
    .rpc('get_design_review_count', { design_uuid: designId })

  if (countError) throw countError

  return {
    averageRating: stats || 0,
    reviewCount: reviewCount || 0
  }
}

// Test function to check designs table access
export async function testDesignsAccess() {
  try {
    console.log('Testing designs table access...')
    
    // First, let's check if we can access the table at all
    const { data, error } = await supabase
      .from('designs')
      .select('count')
      .limit(1)
    
    console.log('Basic access test result:', { data, error })
    
    if (error) {
      console.error('Error accessing designs table:', error)
      return { success: false, error }
    }
    
    // Now try to get actual designs
    const { data: designs, error: designsError } = await supabase
      .from('designs')
      .select('*')
      .limit(5)
    
    console.log('Designs test result:', { designs, designsError })
    
    return { 
      success: !designsError, 
      designs: designs || [], 
      error: designsError 
    }
  } catch (error) {
    console.error('Test function error:', error)
    return { success: false, error }
  }
}

// Get design pairs for comparison review (for testers)
export async function getDesignPairsForReview() {
  try {
    const { data: designPairs, error } = await supabase
      .from('design_pairs')
      .select(`
        *,
        design_a:designs!design_a_id(*),
        design_b:designs!design_b_id(*),
        ratings(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching design pairs:', error)
      throw error
    }

    if (!designPairs) {
      console.log('No design pairs found')
      return []
    }

    return designPairs
  } catch (error) {
    console.error('Error in getDesignPairsForReview:', error)
    throw error
  }
}

// Get designs that need review (for testers) - keeping for backward compatibility
export async function getDesignsForReview() {
  try {
    const { data: designs, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching designs:', error)
      throw error
    }

    if (!designs) {
      console.log('No designs found')
      return []
    }

    // Load reviews for each design
    const designsWithReviews = await Promise.all(
      designs.map(async (design) => {
        try {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('design_id', design.id)
          
          return {
            ...design,
            reviews: reviews || []
          }
        } catch (error) {
          console.error(`Error loading reviews for design ${design.id}:`, error)
          return {
            ...design,
            reviews: []
          }
        }
      })
    )

    return designsWithReviews
  } catch (error) {
    console.error('Error in getDesignsForReview:', error)
    throw error
  }
}

// Get user's review history
export async function getUserReviewHistory(userId: string) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return reviews
}

// Design pair voting statistics
export async function getDesignPairVotingStats(designPairId: string) {
  try {
    // First, get the design pair to know the design IDs
    const { data: designPair, error: pairError } = await supabase
      .from('design_pairs')
      .select('design_a_id, design_b_id')
      .eq('id', designPairId)
      .single()

    if (pairError) throw pairError

    if (!designPair) {
      console.log('Design pair not found:', designPairId)
      return {
        designAVotes: 0,
        designBVotes: 0,
        totalVotes: 0,
        designAPercentage: 0,
        designBPercentage: 0
      }
    }

    // Get all ratings for this design pair
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('chosen_design_id')
      .eq('design_pair_id', designPairId)

    if (error) throw error

    // Count votes for each design
    const designAVotes = ratings?.filter(rating => rating.chosen_design_id === designPair.design_a_id).length || 0
    const designBVotes = ratings?.filter(rating => rating.chosen_design_id === designPair.design_b_id).length || 0
    const totalVotes = ratings?.length || 0

    return {
      designAVotes,
      designBVotes,
      totalVotes,
      designAPercentage: totalVotes > 0 ? Math.round((designAVotes / totalVotes) * 100) : 0,
      designBPercentage: totalVotes > 0 ? Math.round((designBVotes / totalVotes) * 100) : 0
    }
  } catch (error) {
    console.error('Error getting design pair voting stats:', error)
    return {
      designAVotes: 0,
      designBVotes: 0,
      totalVotes: 0,
      designAPercentage: 0,
      designBPercentage: 0
    }
  }
} 