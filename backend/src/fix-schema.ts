// Fix the daily_food_summary unique constraint
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function fixSchema() {
  console.log('🔧 Fixing daily_food_summary unique constraint...')

  try {
    // Use raw SQL via postgres
    const { data, error } = await supabase
      .from('daily_food_summary')
      .select('*')
      .limit(1)

    if (error) {
      console.log('Note: Cannot directly execute DDL via Supabase client')
      console.log('\nPlease run this SQL in Supabase SQL Editor:')
      console.log('https://supabase.com/dashboard/project/ppscyobejqvkthfifvwo/sql\n')
      console.log('SQL to run:')
      console.log('----------------------------------------')
      console.log('-- Drop old constraint')
      console.log('ALTER TABLE daily_food_summary DROP CONSTRAINT IF EXISTS daily_food_summary_date_key_key;')
      console.log('')
      console.log('-- Add new constraint on both columns')
      console.log('ALTER TABLE daily_food_summary ADD CONSTRAINT daily_food_summary_user_id_date_key UNIQUE (user_id, date_key);')
      console.log('----------------------------------------')
    } else {
      console.log('Table exists, but DDL changes require SQL Editor')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

fixSchema()
