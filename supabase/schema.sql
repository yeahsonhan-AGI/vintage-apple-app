-- ============================================
-- Q-Draw OS Database Schema
-- 使用Supabase Auth邮件验证系统
-- ============================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 说明
-- ============================================
-- 用户认证使用Supabase Auth (auth.users表)
-- 所有应用表通过user_id关联到auth.users.id

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CALENDAR TODOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_todos_user_id ON calendar_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_date_key ON calendar_todos(date_key);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_completed ON calendar_todos(completed);

-- RLS Policies
ALTER TABLE calendar_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own todos"
  ON calendar_todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos"
  ON calendar_todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON calendar_todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON calendar_todos FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_calendar_todos_updated_at
  BEFORE UPDATE ON calendar_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FOOD LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key VARCHAR(10) NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50),
  image TEXT,
  meal_type VARCHAR(50) DEFAULT 'snack',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date_key ON food_logs(date_key);
CREATE INDEX IF NOT EXISTS idx_food_logs_category ON food_logs(category);

-- RLS Policies
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DAILY FOOD SUMMARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_food_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key VARCHAR(10) NOT NULL UNIQUE,
  total_calories INTEGER DEFAULT 0,
  total_meals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_food_summary_user_id ON daily_food_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_food_summary_date_key ON daily_food_summary(date_key);

-- RLS Policies
ALTER TABLE daily_food_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own summaries"
  ON daily_food_summary FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update daily summary
-- ============================================
CREATE OR REPLACE FUNCTION update_daily_food_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_food_summary (user_id, date_key, total_calories, total_meals)
  VALUES (
    NEW.user_id,
    NEW.date_key,
    NEW.calories,
    1
  )
  ON CONFLICT (user_id, date_key)
  DO UPDATE SET
    total_calories = daily_food_summary.total_calories + NEW.calories,
    total_meals = daily_food_summary.total_meals + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_summary_on_food_insert
  AFTER INSERT ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_food_summary();

CREATE OR REPLACE FUNCTION update_daily_food_summary_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_food_summary
  SET
    total_calories = total_calories - OLD.calories,
    total_meals = total_meals - 1,
    updated_at = NOW()
  WHERE user_id = OLD.user_id AND date_key = OLD.date_key;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_summary_on_food_delete
  AFTER DELETE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_food_summary_delete();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- 完成！
-- ============================================
-- 邮件验证注册流程：
-- 1. 用户注册 -> Supabase发送确认邮件
-- 2. 用户点击邮件中的确认链接
-- 3. 邮件确认后，用户可以登录
