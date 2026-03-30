-- ============================================
-- Fitness Progress Features Migration
-- Adds personal records and workout completion tracking
-- ============================================

-- Add completed_at and status columns to workout_plans
ALTER TABLE workout_plans
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped'));

-- ============================================
-- PERSONAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  body_part TEXT,
  training_type TEXT NOT NULL CHECK (training_type IN ('strength', 'cardio')),

  -- Strength PRs
  max_weight DECIMAL(5,2),
  max_sets INTEGER,
  max_reps INTEGER,
  max_volume DECIMAL(10,2),

  -- Cardio PRs
  max_duration_minutes DECIMAL(5,2),
  max_distance_km DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one PR per exercise per user
  UNIQUE(user_id, exercise_name, training_type)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_type ON personal_records(training_type);
CREATE INDEX IF NOT EXISTS idx_personal_records_body_part ON personal_records(body_part);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on personal_records table
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Personal Records Policies
CREATE POLICY "Users can view own personal records"
  ON personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal records"
  ON personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal records"
  ON personal_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal records"
  ON personal_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION FOR UPDATED_AT
-- ============================================
-- Trigger to auto-update updated_at on personal_records
CREATE TRIGGER update_personal_records_updated_at
  BEFORE UPDATE ON personal_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
