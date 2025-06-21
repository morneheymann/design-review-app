// Delete User using Supabase Admin API
// Run this script with: node delete-user-admin.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase project URL and service_role key
const supabaseUrl = 'https://harnubprmliuwzowetvi.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // Get this from Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteUser(userEmail) {
  try {
    console.log(`Attempting to delete user: ${userEmail}`)
    
    // First, get the user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail)
    
    if (userError) {
      console.error('Error finding user:', userError)
      return
    }
    
    if (!user.user) {
      console.log('User not found')
      return
    }
    
    const userId = user.user.id
    console.log(`Found user with ID: ${userId}`)
    
    // Delete user's data from all tables
    console.log('Deleting user data from tables...')
    
    // Delete ratings
    const { error: ratingsError } = await supabase
      .from('ratings')
      .delete()
      .eq('tester_id', userId)
    
    if (ratingsError) {
      console.error('Error deleting ratings:', ratingsError)
    } else {
      console.log('✓ Deleted user ratings')
    }
    
    // Delete design pairs
    const { error: pairsError } = await supabase
      .from('design_pairs')
      .delete()
      .eq('designer_id', userId)
    
    if (pairsError) {
      console.error('Error deleting design pairs:', pairsError)
    } else {
      console.log('✓ Deleted user design pairs')
    }
    
    // Delete individual designs
    const { error: designsError } = await supabase
      .from('designs')
      .delete()
      .eq('user_id', userId)
    
    if (designsError) {
      console.error('Error deleting designs:', designsError)
    } else {
      console.log('✓ Deleted user designs')
    }
    
    // Delete AI analysis records
    const { error: aiError } = await supabase
      .from('ai_analysis')
      .delete()
      .eq('user_id', userId)
    
    if (aiError) {
      console.error('Error deleting AI analysis:', aiError)
    } else {
      console.log('✓ Deleted user AI analysis records')
    }
    
    // Delete user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError)
    } else {
      console.log('✓ Deleted user profile')
    }
    
    // Finally, delete the user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
    } else {
      console.log('✓ Successfully deleted user from authentication')
    }
    
    console.log('User deletion completed!')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Usage: Replace with the email of the user you want to delete
const userEmailToDelete = 'user@example.com'

if (userEmailToDelete === 'user@example.com') {
  console.log('Please update the userEmailToDelete variable with the actual email address')
} else {
  deleteUser(userEmailToDelete)
} 