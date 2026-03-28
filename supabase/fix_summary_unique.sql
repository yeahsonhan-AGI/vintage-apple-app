-- Fix the daily_food_summary unique constraint
-- The constraint should be on (user_id, date_key) not just date_key

-- Drop the old unique constraint
ALTER TABLE daily_food_summary DROP CONSTRAINT IF EXISTS daily_food_summary_date_key_key;

-- Add the correct unique constraint on both columns
ALTER TABLE daily_food_summary ADD CONSTRAINT daily_food_summary_user_id_date_key UNIQUE (user_id, date_key);
