import axios, { AxiosError } from 'axios';
import { retryWithBackoff } from '../utils/retryHelper';

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
}`;

export interface GLMAnalysisResult {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

export interface NutritionInfo {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
}

export class FoodAnalysisService {
  private apiKey: string;
  private apiUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.apiKey = process.env.GLM_API_KEY || '';
    this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.maxRetries = 3;
    this.timeout = 30000; // 30 seconds

    if (!this.apiKey) {
      console.warn('GLM_API_KEY not configured. Food analysis will not work.');
    }
  }

  /**
   * Extract base64 data from data URL
   */
  private extractBase64Data(base64Image: string): string {
    if (base64Image.includes(',')) {
      return base64Image.split(',')[1];
    }
    return base64Image;
  }

  /**
   * Extract numeric value from a string (handles formats like "约400-600 kcal", "20-30 g", etc.)
   * Also handles descriptive values like "High", "Medium", "Low"
   * @param value - The value to extract a number from
   * @param defaultValue - Default to use if no number can be extracted (also used for "medium" values)
   * @returns Extracted numeric value
   */
  private extractNumericValue(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();

      // Handle descriptive values - use sensible defaults
      if (lowerValue === 'high' || lowerValue === '很高') {
        return 600; // High calories
      }
      if (lowerValue === 'medium' || lowerValue === 'medium to high' || lowerValue === '中等' || lowerValue === '中高') {
        return defaultValue > 0 ? defaultValue : 400; // Use provided default or 400
      }
      if (lowerValue === 'low' || lowerValue === '很低') {
        return 100; // Low calories
      }
      if (lowerValue === 'negligible' || lowerValue === '极低' || lowerValue === 'none') {
        return 0; // Negligible
      }

      // Match first number in the string (handles "400-600", "约400", "about 20-30", etc.)
      const match = value.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return defaultValue;
  }

  /**
   * Clean and parse JSON response from GLM API
   */
  private parseResponseContent(content: string): GLMAnalysisResult {
    // Try to extract JSON from the response
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    // Find JSON object in the string
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate required fields first
    if (!parsed.food_name) {
      console.error('[GLM API] Missing food_name in parsed response:', parsed);
      throw new Error('Invalid response format: missing required fields');
    }

    console.log('[GLM API] Raw parsed values:', {
      calories: parsed.calories,
      protein_g: parsed.protein_g,
      carbs_g: parsed.carbs_g,
      fat_g: parsed.fat_g
    });

    // Extract and convert numeric values from strings
    const calories = this.extractNumericValue(parsed.calories, 500); // Use 500 as default for descriptive values
    const protein_g = this.extractNumericValue(parsed.protein_g, 20);
    const carbs_g = this.extractNumericValue(parsed.carbs_g, 30);
    const fat_g = this.extractNumericValue(parsed.fat_g, 15);
    const fiber_g = parsed.fiber_g ? this.extractNumericValue(parsed.fiber_g, 2) : undefined;
    const sugar_g = parsed.sugar_g ? this.extractNumericValue(parsed.sugar_g, 5) : undefined;

    console.log('[GLM API] Extracted numeric values:', {
      food_name: parsed.food_name,
      calories,
      protein_g,
      carbs_g,
      fat_g
    });

    // Validate we got at least some calorie estimate
    if (calories <= 0) {
      console.error('[GLM API] Invalid calories after extraction:', calories);
      throw new Error('Invalid response format: missing required fields');
    }

    // Set default values for optional fields
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
    };
  }

  /**
   * Analyze food image using GLM-4V-Vision API
   */
  async analyzeFoodImage(base64Image: string): Promise<GLMAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('GLM API key not configured');
    }

    const base64Data = this.extractBase64Data(base64Image);

    const analysisOperation = async (): Promise<GLMAnalysisResult> => {
      try {
        const response = await axios.post(
          this.apiUrl,
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
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          }
        );

        // Debug: Log the raw response
        console.log('[GLM API] Raw response status:', response.status);
        console.log('[GLM API] Raw response data:', JSON.stringify(response.data, null, 2));

        if (!response.data?.choices?.[0]?.message?.content) {
          console.error('[GLM API] Invalid response structure');
          throw new Error('Invalid API response format');
        }

        const content = response.data.choices[0].message.content;
        console.log('[GLM API] Content:', content);
        return this.parseResponseContent(content);

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          if (axiosError.response) {
            // API returned an error response
            const status = axiosError.response.status;
            const data = axiosError.response.data as any;

            if (status === 401) {
              throw new Error('Invalid GLM API key');
            } else if (status === 429) {
              throw new Error('GLM API rate limit exceeded');
            } else if (status >= 500) {
              throw new Error(`GLM API server error: ${status}`);
            } else {
              throw new Error(data?.error?.message || `GLM API error: ${status}`);
            }
          } else if (axiosError.request) {
            // Request was made but no response received
            if (axiosError.code === 'ECONNABORTED') {
              throw new Error('GLM API request timeout');
            }
            throw new Error('GLM API network error');
          }
        }

        throw error;
      }
    };

    return retryWithBackoff(analysisOperation, { maxRetries: this.maxRetries });
  }

  /**
   * Health check for the service
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const foodAnalysisService = new FoodAnalysisService();
