import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DbCreator {
  id: string;
  name: string;
  handle: string;
  platforms: string[];
  base_score: number;
  avatar: string;
  category: string;
  verified: boolean;
  created_at: string;
}

export interface DbMetrics {
  id: number;
  creator_id: string;
  google_trends: number;
  twitter_mentions: number;
  reddit_posts: number;
  youtube_views: number;
  reach_score: number;
  synced_at: string;
}
