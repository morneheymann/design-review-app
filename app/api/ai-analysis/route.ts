import { NextRequest, NextResponse } from 'next/server'
import { analyzeDesignPair, getDesignInsights } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { designAUrl, designBUrl, title, description, type } = body

    if (!designAUrl || !designBUrl || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: designAUrl, designBUrl, title' },
        { status: 400 }
      )
    }

    if (type === 'pair-analysis') {
      const analysis = await analyzeDesignPair(designAUrl, designBUrl, title, description)
      return NextResponse.json({ analysis })
    } else if (type === 'single-insights') {
      const insights = await getDesignInsights(designAUrl, description)
      return NextResponse.json({ insights })
    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type. Use "pair-analysis" or "single-insights"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('AI Analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze designs' },
      { status: 500 }
    )
  }
} 