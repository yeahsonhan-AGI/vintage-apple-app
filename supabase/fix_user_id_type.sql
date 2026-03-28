-- ============================================
-- 修复 user_id 字段类型（UUID -> TEXT）
-- ============================================
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 由于 Supabase 使用 UUID 作为外键引用 auth.users，
-- 我们需要移除外键约束，然后修改类型

-- 1. 删除外键约束（如果有）
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    -- 获取并删除 workout_plans 的外键约束
    FOR fk_name IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'workout_plans'
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE workout_plans DROP CONSTRAINT IF EXISTS %I', fk_name);
    END LOOP;
END $$;

-- 2. 修改 user_id 列类型为 TEXT
ALTER TABLE workout_plans
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. 验证修改
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_plans'
AND column_name = 'user_id';

-- ============================================
-- 完成后，你应该看到 user_id 的类型为 text
-- ============================================
