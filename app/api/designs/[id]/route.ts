import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    
    // Get the Authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Extract the access token
    const accessToken = authHeader.replace('Bearer ', '')
    
    // Set the access token for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15 compatibility
    const { id: designPairId } = await params

    console.log('Attempting to delete design pair:', designPairId)

    // First, check if the design pair exists and get its details
    const { data: designPair, error: fetchError } = await supabase
      .from('design_pairs')
      .select(`
        *,
        design_a:designs!design_pairs_design_a_id_fkey(*),
        design_b:designs!design_pairs_design_b_id_fkey(*)
      `)
      .eq('id', designPairId)
      .single()

    if (fetchError) {
      console.error('Error fetching design pair:', fetchError)
      return NextResponse.json(
        { error: 'Design pair not found' },
        { status: 404 }
      )
    }

    if (!designPair) {
      return NextResponse.json(
        { error: 'Design pair not found' },
        { status: 404 }
      )
    }

    console.log('Found design pair:', designPair.id)
    console.log('Design A designer:', designPair.design_a?.designer_id)
    console.log('Design B designer:', designPair.design_b?.designer_id)
    console.log('Current user:', user.id)

    // Check if the user is the owner of the design pair
    const isOwner = designPair.design_a?.designer_id === user.id || 
                   designPair.design_b?.designer_id === user.id

    if (!isOwner) {
      return NextResponse.json(
        { error: 'You can only delete your own designs' },
        { status: 403 }
      )
    }

    console.log('User is owner, proceeding with deletion...')

    // Delete related data in the correct order
    // 1. Delete ratings first (foreign key constraint)
    const { error: ratingsError } = await supabase
      .from('ratings')
      .delete()
      .eq('design_pair_id', designPairId)

    if (ratingsError) {
      console.error('Error deleting ratings:', ratingsError)
    }

    // 2. Delete AI analysis if exists
    const { error: aiError } = await supabase
      .from('ai_analysis')
      .delete()
      .eq('design_pair_id', designPairId)

    if (aiError) {
      console.error('Error deleting AI analysis:', aiError)
    }

    // 3. Delete the design pair
    const { error: deletePairError } = await supabase
      .from('design_pairs')
      .delete()
      .eq('id', designPairId)

    if (deletePairError) {
      console.error('Error deleting design pair:', deletePairError)
      return NextResponse.json(
        { error: 'Failed to delete design pair' },
        { status: 500 }
      )
    }

    // 4. Delete the individual designs if they're not used elsewhere
    if (designPair.design_a?.id) {
      const { error: designAError } = await supabase
        .from('designs')
        .delete()
        .eq('id', designPair.design_a.id)

      if (designAError) {
        console.error('Error deleting design A:', designAError)
      }
    }

    if (designPair.design_b?.id) {
      const { error: designBError } = await supabase
        .from('designs')
        .delete()
        .eq('id', designPair.design_b.id)

      if (designBError) {
        console.error('Error deleting design B:', designBError)
      }
    }

    console.log('Design pair deleted successfully')

    return NextResponse.json(
      { message: 'Design pair deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in DELETE /api/designs/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 