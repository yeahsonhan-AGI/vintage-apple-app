import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  // Test environment variables
  const envStatus = {
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0
    },
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      length: process.env.SUPABASE_URL?.length || 0
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    },
    GLM_API_KEY: {
      exists: !!process.env.GLM_API_KEY,
      length: process.env.GLM_API_KEY?.length || 0
    }
  }

  console.log('=== ENV TEST ===')
  console.log('JWT_SECRET exists:', envStatus.JWT_SECRET.exists)
  console.log('JWT_SECRET length:', envStatus.JWT_SECRET.length)

  return res.json({
    success: true,
    environment: envStatus,
    message: envStatus.JWT_SECRET.exists ? 'All environment variables are set' : 'JWT_SECRET is missing!'
  })
}
