-- Add AI Analysis table to store Gemini AI analysis results
-- Run this in your Supabase SQL Editor

-- Create AI analysis table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_pair_id UUID NOT NULL REFERENCES design_pairs(id) ON DELETE CASCADE,
  recommended_design TEXT NOT NULL CHECK (recommended_design IN ('A', 'B', 'tie')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reasoning TEXT NOT NULL,
  strengths_design_a TEXT[] NOT NULL,
  strengths_design_b TEXT[] NOT NULL,
  weaknesses_design_a TEXT[] NOT NULL,
  weaknesses_design_b TEXT[] NOT NULL,
  design_principles TEXT[] NOT NULL,
  user_experience TEXT NOT NULL,
  visual_hierarchy TEXT NOT NULL,
  accessibility TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_design_pair_id ON ai_analysis(design_pair_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at);

-- Enable RLS
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view AI analysis for design pairs they can access" ON ai_analysis
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM design_pairs dp 
    WHERE dp.id = ai_analysis.design_pair_id
  ));

CREATE POLICY "Users can create AI analysis for design pairs they can access" ON ai_analysis
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM design_pairs dp 
    WHERE dp.id = ai_analysis.design_pair_id
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_ai_analysis_updated_at 
  BEFORE UPDATE ON ai_analysis
  FOR EACH ROW EXECUTE FUNCTION update_ai_analysis_updated_at();

-- Verify the table was created
SELECT 'AI Analysis table created successfully!' as info;
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'ai_analysis'
ORDER BY ordinal_position; 