import axios from 'axios'

const SYSTEM_PROMPT = `你是一个专业的食物营养分析助手。请分析用户上传的食物图片，提供以下信息：

1. 食物识别：识别食物种类和名称
2. 热量估算：基于食物份量估算热量（必须是纯数字，单位：kcal）
3. 营养信息：蛋白质、碳水化合物、脂肪含量（必须是纯数字，单位：克）
4. 分类：breakfast/lunch/dinner/snack（小写）
5. 置信度：识别结果的可信程度（high/medium/low，小写）
6. 描述：简短描述食物

重要提示：
- 所有数值必须是纯数字，不要包含单位、文字描述或范围
- calories必须是纯数字（如：450），不要写"约400-600"或"High"
- protein_g、carbs_g、fat_g等也必须是纯数字（如：25），不要写"约20-30克"或"Medium"
- 如果无法准确估算，请给出一个合理的平均值

请以JSON格式返回，不要包含任何其他文字：
{
  "food_name": "食物名称",
  "calories": 450,
  "protein_g": 25,
  "carbs_g": 30,
  "fat_g": 20,
  "fiber_g": 2,
  "sugar_g": 5,
  "meal_type": "dinner",
  "confidence": "high",
  "description": "简短描述"
}`

export interface GLMAnalysisResult {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
  sugar_g?: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  confidence: 'high' | 'medium' | 'low'
  description: string
}

function extractBase64Data(base64Image: string): string {
  if (base64Image.includes(',')) {
    return base64Image.split(',')[1]
  }
  return base64Image
}

function extractNumericValue(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim()

    if (lowerValue === 'high' || lowerValue === '很高') {
      return 600
    }
    if (lowerValue === 'medium' || lowerValue === 'medium to high' || lowerValue === '中等' || lowerValue === '中高') {
      return defaultValue > 0 ? defaultValue : 400
    }
    if (lowerValue === 'low' || lowerValue === '很低') {
      return 100
    }
    if (lowerValue === 'negligible' || lowerValue === '极低' || lowerValue === 'none') {
      return 0
    }

    const match = value.match(/(\d+(?:\.\d+)?)/)
    if (match) {
      return parseFloat(match[1])
    }
  }

  return defaultValue
}

function parseResponseContent(content: string): GLMAnalysisResult {
  let jsonStr = content.trim()

  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1]
  }

  const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    jsonStr = jsonObjectMatch[0]
  }

  const parsed = JSON.parse(jsonStr)

  if (!parsed.food_name) {
    throw new Error('Invalid response format: missing required fields')
  }

  const calories = extractNumericValue(parsed.calories, 500)
  const protein_g = extractNumericValue(parsed.protein_g, 20)
  const carbs_g = extractNumericValue(parsed.carbs_g, 30)
  const fat_g = extractNumericValue(parsed.fat_g, 15)
  const fiber_g = parsed.fiber_g ? extractNumericValue(parsed.fiber_g, 2) : undefined
  const sugar_g = parsed.sugar_g ? extractNumericValue(parsed.sugar_g, 5) : undefined

  if (calories <= 0) {
    throw new Error('Invalid response format: missing required fields')
  }

  return {
    food_name: parsed.food_name || 'Unknown Food',
    calories,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g,
    sugar_g,
    meal_type: parsed.meal_type || 'snack',
    confidence: parsed.confidence || 'medium',
    description: parsed.description || ''
  }
}

export async function analyzeFoodImage(base64Image: string): Promise<GLMAnalysisResult> {
  const apiKey = process.env.GLM_API_KEY || ''
  if (!apiKey) {
    throw new Error('GLM API key not configured')
  }

  const base64Data = extractBase64Data(base64Image)

  const response = await axios.post(
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    {
      model: 'glm-4v',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Data
              }
            },
            {
              type: 'text',
              text: 'Please analyze this food image and return the result in JSON format only.'
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
      top_p: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  )

  if (!response.data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid API response format')
  }

  const content = response.data.choices[0].message.content
  return parseResponseContent(content)
}
