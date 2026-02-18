import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    // google-trends-api is a CommonJS module — require it at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const googleTrends = require('google-trends-api');

    const raw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
    });

    const parsed = JSON.parse(raw);
    const timelineData: Array<{ value: number[] }> =
      parsed?.default?.timelineData ?? [];

    if (timelineData.length === 0) {
      throw new Error('No timeline data from Google Trends');
    }

    // Average the last few data points for a stable number
    const recent = timelineData.slice(-5);
    const avg =
      recent.reduce((sum, d) => sum + (d.value[0] ?? 0), 0) / recent.length;

    res.status(200).json({
      interest: Math.round(avg),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Google Trends error:', error.message);

    // Stable fallback — not random, so scores don't jump on each call
    res.status(200).json({
      interest: 50,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  }
}
