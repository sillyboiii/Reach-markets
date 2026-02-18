import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch all creators
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .order('base_score', { ascending: false });

    if (creatorsError) throw creatorsError;

    if (!creators || creators.length === 0) {
      return res.status(200).json({ creators: [] });
    }

    // Fetch latest metrics for each creator
    const { data: latestMetrics, error: metricsError } = await supabase
      .from('creator_latest_metrics')
      .select('*');

    if (metricsError) {
      console.warn('Could not fetch latest metrics:', metricsError.message);
    }

    // Fetch last 24 metric snapshots per creator for chart history
    const { data: history, error: historyError } = await supabase
      .from('creator_metrics')
      .select('creator_id, reach_score, google_trends, twitter_mentions, reddit_posts, youtube_views, synced_at')
      .in('creator_id', creators.map((c) => c.id))
      .order('synced_at', { ascending: true });

    if (historyError) {
      console.warn('Could not fetch history:', historyError.message);
    }

    // Group history by creator
    const historyByCreator: Record<string, any[]> = {};
    (history ?? []).forEach((row) => {
      if (!historyByCreator[row.creator_id]) {
        historyByCreator[row.creator_id] = [];
      }
      historyByCreator[row.creator_id].push({
        timestamp: row.synced_at,
        score: row.reach_score,
        googleTrends: row.google_trends,
        twitterMentions: row.twitter_mentions,
        redditPosts: row.reddit_posts,
        youtubeViews: row.youtube_views,
      });
    });

    // Build metrics lookup
    const metricsById: Record<string, any> = {};
    (latestMetrics ?? []).forEach((m) => {
      metricsById[m.creator_id] = m;
    });

    // Merge everything
    const enriched = creators.map((creator) => {
      const metrics = metricsById[creator.id];
      const creatorHistory = (historyByCreator[creator.id] ?? []).slice(-24);

      return {
        id: creator.id,
        name: creator.name,
        handle: creator.handle,
        platforms: creator.platforms,
        baseScore: creator.base_score,
        avatar: creator.avatar,
        category: creator.category,
        verified: creator.verified,
        currentScore: metrics?.reach_score ?? creator.base_score,
        googleTrends: metrics?.google_trends ?? 50,
        twitterMentions: metrics?.twitter_mentions ?? 200,
        redditPosts: metrics?.reddit_posts ?? 10,
        youtubeViews: metrics?.youtube_views ?? 5000,
        lastSync: metrics?.synced_at ?? null,
        history: creatorHistory,
      };
    });

    res.status(200).json({ creators: enriched });
  } catch (error: any) {
    console.error('Creators API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
