-- Migration: Add AI analysis fields to food_logs table
-- This migration adds fields to store AI food analysis results

-- Add AI analysis related columns to food_logs table
ALTER TABLE food_logs
ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nutrition_info JSONB DEFAULT '{"protein_g": 0, "carbs_g": 0, "fat_g": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create index on ai_analyzed for faster queries
CREATE INDEX IF NOT EXISTS idx_food_logs_ai_analyzed ON food_logs(ai_analyzed) WHERE ai_analyzed = TRUE;

-- Create index on analyzed_at for sorting by analysis time
CREATE INDEX IF NOT EXISTS idx_food_logs_analyzed_at ON food_logs(analyzed_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN food_logs.ai_analyzed IS 'Whether this food log was analyzed by AI';
COMMENT ON COLUMN food_logs.nutrition_info IS 'JSONB object containing nutrition data: protein_g, carbs_g, fat_g, fiber_g, sugar_g';
COMMENT ON COLUMN food_logs.ai_confidence IS 'AI confidence level: high, medium, or low';
COMMENT ON COLUMN food_logs.ai_description IS 'AI-generated description of the food';
COMMENT ON COLUMN food_logs.analyzed_at IS 'Timestamp when AI analysis was performed';

-- Create a function to update nutrition info when calories change
CREATE OR REPLACE FUNCTION update_nutrition_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to update daily nutrition summaries
  -- when food logs are created or updated
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function (optional, for future use)
-- DROP TRIGGER IF EXISTS trigger_update_nutrition_summary ON food_logs;
-- CREATE TRIGGER trigger_update_nutrition_summary
-- AFTER INSERT OR UPDATE ON food_logs
-- FOR EACH ROW
-- EXECUTE FUNCTION update_nutrition_summary();
