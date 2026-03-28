-- ============================================
-- 更新 RLS 策略以支持自定义 JWT 认证
-- ============================================
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 删除旧的策略
DROP POLICY IF EXISTS "Users can view own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can create own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can update own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can delete own workout plans" ON workout_plans;

DROP POLICY IF EXISTS "Users can view strength exercises through workout plans" ON strength_exercises;
DROP POLICY IF EXISTS "Users can create strength exercises for own plans" ON strength_exercises;
DROP POLICY IF EXISTS "Users can update strength exercises in own plans" ON strength_exercises;
DROP POLICY IF EXISTS "Users can delete strength exercises from own plans" ON strength_exercises;

DROP POLICY IF EXISTS "Users can view cardio exercises through workout plans" ON cardio_exercises;
DROP POLICY IF EXISTS "Users can create cardio exercises for own plans" ON cardio_exercises;
DROP POLICY IF EXISTS "Users can update cardio exercises in own plans" ON cardio_exercises;
DROP POLICY IF EXISTS "Users can delete cardio exercises from own plans" ON cardio_exercises;

-- ============================================
-- 开发模式策略：允许所有操作（用于 demo）
-- ============================================

-- Workout Plans - 开发模式宽松策略
CREATE POLICY "Dev: Allow all access to workout_plans"
  ON workout_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- Strength Exercises - 开发模式宽松策略
CREATE POLICY "Dev: Allow all access to strength_exercises"
  ON strength_exercises FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cardio Exercises - 开发模式宽松策略
CREATE POLICY "Dev: Allow all access to cardio_exercises"
  ON cardio_exercises FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 说明
-- ============================================
-- 当前使用开发模式策略，允许所有操作
-- 生产环境应该启用以下基于 user_id 的策略：

/*
CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT
  USING (user_id = current_setting('request.jwt.claim.userId', true));

CREATE POLICY "Users can create own workout plans"
  ON workout_plans FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claim.userId', true));

-- 其他策略类似...
*/
