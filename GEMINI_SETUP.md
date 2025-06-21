# Gemini AI Integration Setup

This guide will help you set up Google Gemini AI to analyze design variations and provide AI-powered recommendations.

## Prerequisites

1. **Google AI Studio Account**: You need a Google account to access Gemini AI
2. **API Key**: Get your Gemini API key from Google AI Studio

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local` (if you haven't already)
2. Add your Gemini API key to `.env.local`:

```bash
# Google Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Step 3: Set Up Database

Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of add-ai-analysis-table.sql
```

This will create the `ai_analysis` table to store AI analysis results.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Go to a design review page (`/review/[id]`)
3. Look for the "AI Design Analysis" section
4. Click "Run AI Analysis"
5. Wait for the analysis to complete (this may take 10-30 seconds)

## Features

### AI Analysis Capabilities

The Gemini AI integration provides:

- **Design Comparison**: Analyzes both design variations side-by-side
- **Recommendation**: Suggests which design works better with confidence score
- **Strengths & Weaknesses**: Identifies what each design does well and areas for improvement
- **Design Principles**: Highlights key design principles used
- **User Experience**: Analyzes usability and user flow
- **Visual Hierarchy**: Evaluates information architecture
- **Accessibility**: Assesses accessibility considerations

### Analysis Criteria

The AI evaluates designs based on:

1. **Visual Hierarchy**: Information architecture and visual flow
2. **User Experience**: Intuitiveness and user-friendliness
3. **Aesthetics**: Visual appeal and modern design
4. **Accessibility**: Support for users with different abilities
5. **Brand Consistency**: Professional brand representation
6. **Mobile Responsiveness**: Cross-device compatibility
7. **Performance**: Loading speed and efficiency

## Usage

### For Designers

1. Upload your design variations
2. Create a design pair
3. Use AI analysis to get objective feedback
4. Compare AI insights with human feedback
5. Make data-driven design decisions

### For Testers

1. Review design variations
2. See AI analysis alongside your own assessment
3. Compare your choice with AI recommendations
4. Learn from AI insights about design principles

## Troubleshooting

### Common Issues

1. **"Failed to analyze designs"**
   - Check your API key is correct
   - Ensure images are accessible URLs
   - Verify you have sufficient API quota

2. **"Missing required fields"**
   - Make sure both design images are uploaded
   - Check design pair has a title

3. **Slow analysis**
   - AI analysis can take 10-30 seconds
   - Large images may take longer
   - Check your internet connection

### API Limits

- Google Gemini has rate limits and usage quotas
- Monitor your usage in [Google AI Studio](https://makersuite.google.com/app/apikey)
- Consider implementing caching for repeated analyses

## Security

- API keys are stored in environment variables
- Never commit API keys to version control
- Use `.env.local` for local development
- Set up proper environment variables in production

## Cost

- Google Gemini pricing: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)
- Vision API calls are typically inexpensive
- Monitor usage to avoid unexpected charges

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is working
3. Test with different design images
4. Check the Supabase logs for database errors 