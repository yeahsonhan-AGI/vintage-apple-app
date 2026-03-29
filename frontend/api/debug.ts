import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Collect all information
  const debugInfo = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    // Check all possible header name variations
    authorizationHeaders: {
      authorization: req.headers['authorization'],
      Authorization: req.headers['Authorization'],
      lowercase_auth: (req.headers as any)['authorization'],
      uppercase_auth: (req.headers as any)['Authorization']
    },
    environment: {
      JWT_SECRET_exists: !!process.env.JWT_SECRET,
      JWT_SECRET_length: process.env.JWT_SECRET?.length || 0
    }
  }

  console.log('=== DEBUG REQUEST ===')
  console.log('Method:', req.method)
  console.log('Headers:', JSON.stringify(req.headers, null, 2))
  console.log('Authorization header found:', !!(req.headers['authorization'] || req.headers['Authorization']))

  return res.json(debugInfo)
}
