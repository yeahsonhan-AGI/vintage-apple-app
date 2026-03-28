// 测试 Supabase 连接和 RLS 策略
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  console.log('=== 测试 Supabase 连接 ===')
  console.log('URL:', process.env.SUPABASE_URL)
  console.log('')

  try {
    // 测试 1: 查询 workout_plans 表
    console.log('测试 1: 查询 workout_plans 表')
    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')

    console.log('结果:', plans ? '成功' : '失败')
    console.log('数据:', plans)
    console.log('错误:', plansError)
    console.log('')

    // 测试 2: 尝试插入一条测试数据
    console.log('测试 2: 插入测试数据')
    const { data: newPlan, error: insertError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: 'demo-user',
        date_key: '2026-03-27',
        training_type: 'strength',
      })
      .select()

    console.log('结果:', newPlan ? '成功' : '失败')
    console.log('数据:', newPlan)
    console.log('错误:', insertError)
    console.log('')

    // 测试 3: 查询特定用户的数据
    console.log('测试 3: 查询 demo-user 的数据')
    const { data: userPlans, error: userPlansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', 'demo-user')

    console.log('结果:', userPlans ? '成功' : '失败')
    console.log('数据:', userPlans)
    console.log('错误:', userPlansError)

  } catch (error) {
    console.error('测试失败:', error)
  }
}

testConnection()
