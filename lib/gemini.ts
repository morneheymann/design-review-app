import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: await fetchImageAsBase64(designAUrl)
        }
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: await fetchImageAsBase64(designBUrl)
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis
    return analysis
  } catch (error) {
    console.error('Gemini AI analysis error:', error)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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