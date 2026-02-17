import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    // Note: Google Trends doesn't have an official API
    // You can use google-trends-api npm package or a third-party service
    // For this example, we'll use mock data but structure it properly

    const apiKey = process.env.GOOGLE_TRENDS_API_KEY;

    if (!apiKey) {
      console.warn('No Google Trends API key - using mock data');
      return res.status(200).json({
        interest: Math.floor(Math.random() * 100) + 20,
        timestamp: new Date().toISOString(),
      });
    }

    // If you have a third-party Google Trends API service:
    // const response = await axios.get('https://trends-api-service.com/search', {
    //   params: { keyword, timeframe: 'now 1-d' },
    //   headers: { 'X-API-Key': apiKey }
    // });

    // For now, return mock data
    res.status(200).json({
      interest: Math.floor(Math.random() * 100) + 20,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  } catch (error: any) {
    console.error('Google Trends error:', error.message);

    res.status(200).json({
      interest: Math.floor(Math.random() * 100) + 20,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
