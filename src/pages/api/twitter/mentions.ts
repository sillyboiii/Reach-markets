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
      console.warn('No Twitter API key - using mock data');
      return res.status(200).json({
        count: Math.floor(Math.random() * 1000) + 200,
        timestamp: new Date().toISOString(),
        mock: true,
      });
    }

    // Free tier: use recent search endpoint and count results
    // (tweets/counts/recent requires Basic $100/mo tier)
    const query = `${handle} -is:retweet lang:en`;
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/search/recent',
      {
        params: {
          query,
          max_results: 100,
          'tweet.fields': 'created_at',
        },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    const count = response.data.meta?.result_count ?? 0;

    res.status(200).json({
      count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Twitter API error:', error.response?.data || error.message);

    res.status(200).json({
      count: Math.floor(Math.random() * 1000) + 200,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
