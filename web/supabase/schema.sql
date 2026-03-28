-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- auth.users already exists

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar todos table
CREATE TABLE IF NOT EXISTS calendar_todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food logs table
CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    meal_type TEXT DEFAULT 'snack',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily food summary (for easier queries)
CREATE TABLE IF NOT EXISTS daily_food_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL UNIQUE,
    total_calories INTEGER DEFAULT 0,
    meal_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_food_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar_todos" ON calendar_todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar_todos" ON calendar_todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar_todos" ON calendar_todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar_todos" ON calendar_todos
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own food_logs" ON food_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food_logs" ON food_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food_logs" ON food_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food_logs" ON food_logs
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily_food_summary" ON daily_food_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_food_summary" ON daily_food_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_food_summary" ON daily_food_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_user_id ON calendar_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_date_key ON calendar_todos(date_key);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date_key ON food_logs(date_key);
CREATE INDEX IF NOT EXISTS idx_daily_food_summary_user_id ON daily_food_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_food_summary_date_key ON daily_food_summary(date_key);

-- Function to update daily food summary
CREATE OR REPLACE FUNCTION update_daily_food_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_food_summary (user_id, date_key, total_calories, meal_count)
    VALUES (NEW.user_id, NEW.date_key, NEW.calories, 1)
    ON CONFLICT (user_id, date_key)
    DO UPDATE SET
        total_calories = daily_food_summary.total_calories + NEW.calories,
        meal_count = daily_food_summary.meal_count + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update daily summary
DROP TRIGGER IF EXISTS update_food_summary_trigger ON food_logs;
CREATE TRIGGER update_food_summary_trigger
    AFTER INSERT ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_food_summary();
