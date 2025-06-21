export interface User {
  id: string
  user_id: string
  user_type: 'designer' | 'tester'
  full_name?: string
  bio?: string
  created_at: string
  updated_at: string
  user_profiles?: UserProfile[]
}

export interface UserProfile {
  id: string
  user_id: string
  user_type: 'designer' | 'tester'
  full_name?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Design {
  id: string
  designer_id: string
  title: string
  description?: string
  image_url: string
  created_at: string
  is_active: boolean
  designer?: User
  reviews?: Review[]
  reviewStats?: {
    averageRating: number
    reviewCount: number
  }
}

export interface DesignPair {
  id: string
  designer_id: string
  design_a_id: string
  design_b_id: string
  title: string
  description?: string
  created_at: string
  is_active: boolean
  design_a?: Design
  design_b?: Design
  ratings?: Rating[]
  ai_analysis?: AIAnalysis[]
}

export interface Rating {
  id: string
  tester_id: string
  design_pair_id: string
  chosen_design_id: string
  feedback?: string
  created_at: string
  design_pair?: DesignPair
  chosen_design?: Design
}

export interface AIAnalysis {
  id: string
  design_pair_id: string
  recommended_design: 'A' | 'B' | 'tie'
  confidence: number
  reasoning: string
  strengths_design_a: string[]
  strengths_design_b: string[]
  weaknesses_design_a: string[]
  weaknesses_design_b: string[]
  design_principles: string[]
  user_experience: string
  visual_hierarchy: string
  accessibility: string
  created_at: string
  updated_at: string
  design_pair?: DesignPair
}

// New review-related types
export interface Review {
  id: string
  design_id: string
  reviewer_id: string
  rating?: number
  feedback?: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  design?: Design
  reviewer?: User
  comments?: Comment[]
}

export interface Comment {
  id: string
  review_id: string
  reviewer_id: string
  content: string
  x_position?: number
  y_position?: number
  created_at: string
  updated_at: string
  reviewer?: User
}

export interface ReviewSession {
  id: string
  design_id: string
  reviewer_id: string
  started_at: string
  completed_at?: string
  duration_minutes?: number
  design?: Design
  reviewer?: User
} 