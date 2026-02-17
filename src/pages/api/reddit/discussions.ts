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
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('No Reddit API credentials - using mock data');
      return res.status(200).json({
        count: Math.floor(Math.random() * 50) + 10,
        timestamp: new Date().toISOString(),
      });
    }

    // Get Reddit access token
    const authResponse = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ReachMarkets/1.0',
        },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Search Reddit
    const searchResponse = await axios.get(
      'https://oauth.reddit.com/search',
      {
        params: {
          q: keyword,
          sort: 'new',
          limit: 100,
          t: 'day', // Last 24 hours
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'ReachMarkets/1.0',
        },
      }
    );

    const count = searchResponse.data.data.children.length;

    res.status(200).json({
      count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Reddit API error:', error.message);

    res.status(200).json({
      count: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
