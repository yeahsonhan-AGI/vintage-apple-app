-- ============================================
-- Fitness App Database Setup for Supabase
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKOUT PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  training_type TEXT NOT NULL CHECK (training_type IN ('cardio', 'strength')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON workout_plans(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_workout_plans_date ON workout_plans(date_key);

-- ============================================
-- STRENGTH EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS strength_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  body_part TEXT NOT NULL CHECK (body_part IN ('chest', 'back', 'legs', 'shoulders', 'arms', 'core')),
  exercise_name TEXT NOT NULL,
  equipment TEXT NOT NULL,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight DECIMAL(5,2),
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_strength_exercises_workout_plan ON strength_exercises(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_strength_exercises_body_part ON strength_exercises(body_part);

-- ============================================
-- CARDIO EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cardio_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('running', 'cycling', 'swimming', 'hiit', 'other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  distance_km DECIMAL(5,2),
  calories_burned INTEGER,
  intensity_level TEXT CHECK (intensity_level IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cardio_exercises_workout_plan ON cardio_exercises(workout_plan_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardio_exercises ENABLE ROW LEVEL SECURITY;

-- Workout Plans Policies
CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout plans"
  ON workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Strength Exercises Policies (through workout plans)
CREATE POLICY "Users can view strength exercises through workout plans"
  ON strength_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = strength_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create strength exercises for own plans"
  ON strength_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = strength_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update strength exercises in own plans"
  ON strength_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = strength_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete strength exercises from own plans"
  ON strength_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = strength_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

-- Cardio Exercises Policies (through workout plans)
CREATE POLICY "Users can view cardio exercises through workout plans"
  ON cardio_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = cardio_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cardio exercises for own plans"
  ON cardio_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = cardio_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cardio exercises in own plans"
  ON cardio_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = cardio_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cardio exercises from own plans"
  ON cardio_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = cardio_exercises.workout_plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTION FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- You can verify the tables were created by running:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('workout_plans', 'strength_exercises', 'cardio_exercises');
