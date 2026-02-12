import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper function to format month labels
function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

// Helper function to build the AI prompt
function buildInsightPrompt(
  accomplishments: any[],
  type: string,
  key: string
): string {
  const timeframeLabel = type === 'year' ? key : formatMonthLabel(key);
  const sortedAccomplishments = accomplishments
    .sort((a, b) => b.rating - a.rating)
    .map((a, i) => `${i + 1}. [Impact: ${a.rating}/10] ${a.text}`)
    .join('\n');

  return `You are an insightful career coach analyzing someone's accomplishments for ${timeframeLabel}.

Accomplishments (${accomplishments.length} total):
${sortedAccomplishments}

Please provide a thoughtful, encouraging analysis in 3-4 paragraphs that:
1. Identifies patterns and themes across their accomplishments
2. Highlights their highest-impact work (ratings 8-10)
3. Notes areas of growth or consistent focus
4. Offers one actionable insight or suggestion for the next period

Keep the tone warm, professional, and motivating. Use markdown formatting for readability.`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if AI is configured
  if (!genAI || !apiKey) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'Please configure GOOGLE_AI_API_KEY environment variable in Vercel',
    });
  }

  try {
    const { accomplishments, timeframeType, timeframeKey } = req.body;

    // Validation
    if (!accomplishments || !Array.isArray(accomplishments)) {
      return res.status(400).json({ error: 'Accomplishments array required' });
    }

    if (accomplishments.length === 0) {
      return res.status(400).json({ error: 'Cannot generate insight for empty accomplishments' });
    }

    if (!timeframeType || !['month', 'year'].includes(timeframeType)) {
      return res.status(400).json({ error: 'Invalid timeframe type. Must be "month" or "year"' });
    }

    if (!timeframeKey || typeof timeframeKey !== 'string') {
      return res.status(400).json({ error: 'Timeframe key required' });
    }

    // Truncate if too many accomplishments (to stay within token limits)
    const maxAccomplishments = 100;
    const truncatedAccomplishments = accomplishments.length > maxAccomplishments
      ? accomplishments.slice(0, maxAccomplishments)
      : accomplishments;

    // Generate insight using Google AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = buildInsightPrompt(truncatedAccomplishments, timeframeType, timeframeKey);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insight = response.text();

    return res.status(200).json({
      insight,
      accomplishmentCount: accomplishments.length,
      accomplishmentIds: accomplishments.map((a: any) => a.id),
    });

  } catch (error: any) {
    console.error('AI generation error:', error);

    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    return res.status(500).json({
      error: 'Failed to generate insight',
      message: error.message || 'Unknown error occurred'
    });
  }
}
