import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { handle } = req.query;

  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({ error: 'Handle is required' });
  }

  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      // Fallback to mock data if no API key
      console.warn('No Twitter API key - using mock data');
      return res.status(200).json({
        count: Math.floor(Math.random() * 1000) + 200,
        timestamp: new Date().toISOString(),
      });
    }

    // Twitter API v2: Recent search endpoint
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/counts/recent',
      {
        params: {
          query: handle,
          granularity: 'hour',
        },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    const totalCount = response.data.meta?.total_tweet_count || 0;

    res.status(200).json({
      count: totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Twitter API error:', error.message);
    
    // Return mock data on error
    res.status(200).json({
      count: Math.floor(Math.random() * 1000) + 200,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
