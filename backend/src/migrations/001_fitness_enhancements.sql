-- Fitness Feature UX Enhancement Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ppscyobejqvkthfifvwo/sql

-- ============================================
-- 1. WORKOUT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  training_type VARCHAR(20) NOT NULL CHECK (training_type IN ('strength', 'cardio')),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_training_type ON workout_templates(training_type);

-- ============================================
-- 2. TEMPLATE EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  -- Strength training fields
  body_part VARCHAR(50),
  exercise_name VARCHAR(100) NOT NULL,
  equipment VARCHAR(50),
  sets INTEGER,
  reps INTEGER,
  weight DECIMAL(10,2),
  -- Cardio training fields
  exercise_type VARCHAR(100),
  duration_minutes INTEGER,
  distance_km DECIMAL(10,2),
  calories_burned INTEGER,
  intensity_level VARCHAR(50),
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_exercise_name ON template_exercises(exercise_name);

-- ============================================
-- 3. PERSONAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name VARCHAR(100) NOT NULL,
  body_part VARCHAR(50),
  training_type VARCHAR(20) NOT NULL CHECK (training_type IN ('strength', 'cardio')),
  -- Strength PR fields
  max_weight DECIMAL(10,2),
  max_sets INTEGER,
  max_reps INTEGER,
  max_volume DECIMAL(12,2), -- weight * sets * reps
  -- Cardio PR fields
  max_duration_minutes INTEGER,
  max_distance_km DECIMAL(10,2),
  max_calories_burned INTEGER,
  -- Metadata
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint: one PR per user per exercise
CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_records_user_exercise
  ON personal_records(user_id, exercise_name, training_type);

-- ============================================
-- 4. ADD COLUMNS TO WORKOUT_PLANS
-- ============================================
-- Add template_id column to track which template was used
ALTER TABLE workout_plans
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL;

-- Add notes column for workout notes
ALTER TABLE workout_plans
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add completed_at timestamp to track when workout was completed
ALTER TABLE workout_plans
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 5. INSERT SYSTEM TEMPLATES
-- ============================================
-- Strength Training Templates

-- Chest Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Chest Day', 'Focus on chest muscles with compound and isolation movements', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Back Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Back Day', 'Comprehensive back training for width and thickness', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Leg Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Leg Day', 'Complete lower body training session', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Shoulder Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Shoulder Day', 'Shoulder focused workout for delts and traps', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Arm Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Arm Day', 'Biceps and triceps focused training', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Core Day
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Core Day', 'Abdominal and core strength workout', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- 5x5 Strong Lifts
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, '5x5 Strong Lifts', 'Classic 5x5 strength program with compound movements', 'strength', TRUE)
  ON CONFLICT DO NOTHING;

-- Cardio Templates
INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'HIIT Session', 'High intensity interval training', 'cardio', TRUE)
  ON CONFLICT DO NOTHING;

INSERT INTO workout_templates (user_id, name, description, training_type, is_system) VALUES
  (NULL, 'Steady Cardio', 'Moderate intensity steady state cardio', 'cardio', TRUE)
  ON CONFLICT DO NOTHING;

-- ============================================
-- 6. INSERT TEMPLATE EXERCISES FOR SYSTEM TEMPLATES
-- ============================================
-- Note: In a real deployment, you would fetch the template IDs and insert exercises
-- This is a simplified version - in production, use the actual IDs from the inserts above

-- Get template IDs and insert exercises (this would be done in a script)
-- For now, the application can handle this dynamically

-- ============================================
-- 7. CREATE FUNCTIONS FOR AUTOMATIC PR TRACKING
-- ============================================

-- Function to check and update personal records
CREATE OR REPLACE FUNCTION check_and_update_pr()
RETURNS TRIGGER AS $$
DECLARE
  existing_pr RECORD;
  is_new_pr BOOLEAN := FALSE;
BEGIN
  -- Only process completed workouts
  IF NEW.completed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- For strength exercises, check if this is a new PR
  IF TG_TABLE_NAME = 'strength_exercises' THEN
    -- Get the exercise details to find the exercise name
    -- Check if PR exists
    SELECT * INTO existing_pr
    FROM personal_records
    WHERE user_id = (SELECT user_id FROM workout_plans WHERE id = NEW.workout_plan_id)
      AND exercise_name = NEW.exercise_name
      AND training_type = 'strength';

    IF NOT FOUND THEN
      -- Create new PR
      INSERT INTO personal_records (
        user_id, exercise_name, body_part, training_type,
        max_weight, max_sets, max_reps, max_volume,
        achieved_at, workout_plan_id
      )
      SELECT
        wp.user_id,
        NEW.exercise_name,
        NEW.body_part,
        'strength',
        NEW.weight,
        NEW.sets,
        NEW.reps,
        (NEW.weight * NEW.sets * NEW.reps),
        NEW.completed_at,
        NEW.workout_plan_id
      FROM workout_plans wp
      WHERE wp.id = NEW.workout_plan_id;

    ELSE
      -- Update if better
      is_new_pr := FALSE;

      IF NEW.weight > COALESCE(existing_pr.max_weight, 0) THEN
        existing_pr.max_weight := NEW.weight;
        is_new_pr := TRUE;
      END IF;

      IF NEW.sets > COALESCE(existing_pr.max_sets, 0) THEN
        existing_pr.max_sets := NEW.sets;
        is_new_PR := TRUE;
      END IF;

      IF NEW.reps > COALESCE(existing_pr.max_reps, 0) THEN
        existing_pr.max_reps := NEW.reps;
        is_new_PR := TRUE;
      END IF;

      IF (NEW.weight * NEW.sets * NEW.reps) > COALESCE(existing_pr.max_volume, 0) THEN
        existing_pr.max_volume := (NEW.weight * NEW.sets * NEW.reps);
        is_new_PR := TRUE;
      END IF;

      IF is_new_PR THEN
        UPDATE personal_records
        SET
          max_weight = COALESCE(existing_pr.max_weight, max_weight),
          max_sets = COALESCE(existing_pr.max_sets, max_sets),
          max_reps = COALESCE(existing_pr.max_reps, max_reps),
          max_volume = COALESCE(existing_pr.max_volume, max_volume),
          achieved_at = NOW(),
          workout_plan_id = NEW.workout_plan_id,
          updated_at = NOW()
        WHERE id = existing_pr.id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================
-- Templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own and system templates"
  ON workout_templates FOR SELECT
  USING (user_id = auth.uid() OR is_system = TRUE);
CREATE POLICY "Users can create their own templates"
  ON workout_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own templates"
  ON workout_templates FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own templates"
  ON workout_templates FOR DELETE
  USING (user_id = auth.uid());

-- Template Exercises
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view exercises from their templates"
  ON template_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_templates
    WHERE workout_templates.id = template_exercises.template_id
    AND (workout_templates.user_id = auth.uid() OR workout_templates.is_system = TRUE)
  ));
CREATE POLICY "Users can create exercises for their templates"
  ON template_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_templates
    WHERE workout_templates.id = template_exercises.template_id
    AND workout_templates.user_id = auth.uid()
  ));
CREATE POLICY "Users can update exercises for their templates"
  ON template_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_templates
    WHERE workout_templates.id = template_exercises.template_id
    AND workout_templates.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete exercises for their templates"
  ON template_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_templates
    WHERE workout_templates.id = template_exercises.template_id
    AND workout_templates.user_id = auth.uid()
  ));

-- Personal Records
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own PRs"
  ON personal_records FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own PRs"
  ON personal_records FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own PRs"
  ON personal_records FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
