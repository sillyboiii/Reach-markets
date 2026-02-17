import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      console.warn('No Twitter API key - using mock data');
      return res.status(200).json({
        creators: ['@newviralcreator', '@trendingnow', '@hotinfluencer'],
        timestamp: new Date().toISOString(),
      });
    }

    // Get trending topics
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/search/recent',
      {
        params: {
          query: '(influencer OR creator OR streamer) -is:retweet',
          max_results: 100,
          'tweet.fields': 'public_metrics,author_id',
        },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    // Extract trending handles
    const tweets = response.data.data || [];
    const authorIds = Array.from(new Set(tweets.map((t: any) => t.author_id)));

    // Get user details (limited to 100)
    const usersResponse = await axios.get(
      'https://api.twitter.com/2/users',
      {
        params: {
          ids: authorIds.slice(0, 100).join(','),
          'user.fields': 'username,public_metrics',
        },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    // Sort by followers and extract usernames
    const users = usersResponse.data.data || [];
    const topCreators = users
      .sort(
        (a: any, b: any) =>
          b.public_metrics.followers_count - a.public_metrics.followers_count
      )
      .slice(0, 10)
      .map((u: any) => `@${u.username}`);

    res.status(200).json({
      creators: topCreators,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Twitter trending API error:', error.message);

    // Return mock trending creators
    res.status(200).json({
      creators: ['@newviralcreator', '@trendingnow', '@hotinfluencer'],
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
