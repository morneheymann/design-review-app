import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

console.log('Gemini configuration:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  keyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length,
  keyPreview: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10) + '...' : 
    'none'
})

export interface AIAnalysis {
  recommendedDesign: 'A' | 'B' | 'tie'
  confidence: number
  reasoning: string
  strengths: {
    designA: string[]
    designB: string[]
  }
  weaknesses: {
    designA: string[]
    designB: string[]
  }
  designPrinciples: string[]
  userExperience: string
  visualHierarchy: string
  accessibility: string
}

export async function analyzeDesignPair(
  designAUrl: string,
  designBUrl: string,
  title: string,
  description?: string
): Promise<AIAnalysis> {
  try {
    console.log('Starting AI analysis:', {
      designAUrl,
      designBUrl,
      title,
      hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyPreview: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 
        process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10) + '...' : 
        'none'
    })

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    // Try different models in order of preference
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision']
    let model = null
    let lastError = null

    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        
        // Test the model with a simple prompt first
        const testResult = await model.generateContent('Hello, this is a test.')
        await testResult.response
        console.log(`Model ${modelName} is working`)
        break
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error)
        lastError = error
        continue
      }
    }

    if (!model) {
      throw new Error(`All models failed. Last error: ${lastError}`)
    }

    const prompt = `
You are an expert UI/UX designer and design analyst. Analyze these two design variations and provide a comprehensive comparison.

Design Context:
- Title: ${title}
- Description: ${description || 'No description provided'}

Please analyze both designs considering:

1. **Visual Hierarchy**: Which design has better information architecture and visual flow?
2. **User Experience**: Which design would be more intuitive and user-friendly?
3. **Aesthetics**: Which design is more visually appealing and modern?
4. **Accessibility**: Which design is more accessible to users with different abilities?
5. **Brand Consistency**: Which design better represents a professional brand?
6. **Mobile Responsiveness**: Which design would work better across different screen sizes?
7. **Performance**: Which design would load faster and be more efficient?

Provide your analysis in the following JSON format:
{
  "recommendedDesign": "A" or "B" or "tie",
  "confidence": 0-100,
  "reasoning": "Detailed explanation of your recommendation",
  "strengths": {
    "designA": ["strength1", "strength2"],
    "designB": ["strength1", "strength2"]
  },
  "weaknesses": {
    "designA": ["weakness1", "weakness2"],
    "designB": ["weakness1", "weakness2"]
  },
  "designPrinciples": ["principle1", "principle2"],
  "userExperience": "Analysis of user experience",
  "visualHierarchy": "Analysis of visual hierarchy",
  "accessibility": "Analysis of accessibility"
}

Be objective, thorough, and provide actionable insights.
`

    console.log('Fetching images for analysis...')
    const imageA = await fetchImageAsBase64(designAUrl)
    const imageB = await fetchImageAsBase64(designBUrl)
    console.log('Images fetched successfully')

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageA
        }
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageB
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    console.log('AI response received:', text.substring(0, 200) + '...')
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to parse AI response. Full response:', text)
      throw new Error('Failed to parse AI response')
    }

    const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis
    console.log('Analysis completed successfully')
    return analysis
  } catch (error) {
    console.error('Gemini AI analysis error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze designs with AI: ${error.message}`)
    }
    throw new Error('Failed to analyze designs with AI')
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return base64
  } catch (error) {
    console.error('Error fetching image:', error)
    throw new Error('Failed to fetch image for AI analysis')
  }
}

export async function getDesignInsights(designUrl: string, context?: string): Promise<string> {
  try {
    // Try different models in order of preference
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision']
    let model = null
    let lastError = null

    for (const modelName of models) {
      try {
        console.log(`Trying model for insights: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        
        // Test the model with a simple prompt first
        const testResult = await model.generateContent('Hello, this is a test.')
        await testResult.response
        console.log(`Model ${modelName} is working for insights`)
        break
      } catch (error) {
        console.log(`Model ${modelName} failed for insights:`, error)
        lastError = error
        continue
      }
    }

    if (!model) {
      throw new Error(`All models failed for insights. Last error: ${lastError}`)
    }

    const prompt = `
You are a design expert. Analyze this design and provide insights about:

1. Visual design principles used
2. Color scheme and typography choices
3. Layout and spacing
4. User experience considerations
5. Potential improvements

Context: ${context || 'General design analysis'}

Provide a concise, professional analysis with specific observations and recommendations.
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: await fetchImageAsBase64(designUrl)
        }
      }
    ])

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini AI insights error:', error)
    throw new Error('Failed to get design insights')
  }
} 