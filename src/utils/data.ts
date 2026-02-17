// Real trending influencers with their social handles and avatars
export const TRENDING_CREATORS = [
  {
    id: 'cr1',
    name: 'Clavicular',
    handle: '@clavicular_',
    platforms: ['Twitter', 'YouTube', 'TikTok'],
    baseScore: 89,
    avatar: 'https://unavatar.io/twitter/clavicular_',
    category: 'Lifestyle',
    verified: true,
  },
  {
    id: 'cr2',
    name: 'Andrew Tate',
    handle: '@Cobratate',
    platforms: ['Twitter', 'Instagram', 'Rumble'],
    baseScore: 94,
    avatar: 'https://unavatar.io/twitter/Cobratate',
    category: 'Business',
    verified: true,
  },
  {
    id: 'cr3',
    name: 'ASU Frat Leader',
    handle: '@asufratstar',
    platforms: ['Twitter', 'TikTok', 'Instagram'],
    baseScore: 76,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=asufrat',
    category: 'Viral',
    verified: false,
  },
  {
    id: 'cr4',
    name: 'Adin Ross',
    handle: '@adinross',
    platforms: ['Kick', 'Twitter', 'YouTube'],
    baseScore: 91,
    avatar: 'https://unavatar.io/twitter/adinross',
    category: 'Gaming',
    verified: true,
  },
  {
    id: 'cr5',
    name: 'IShowSpeed',
    handle: '@ishowspeed',
    platforms: ['YouTube', 'Twitter', 'TikTok'],
    baseScore: 93,
    avatar: 'https://unavatar.io/twitter/ishowspeed',
    category: 'Entertainment',
    verified: true,
  },
  {
    id: 'cr6',
    name: 'Kai Cenat',
    handle: '@kaicenat',
    platforms: ['Twitch', 'Twitter', 'YouTube'],
    baseScore: 92,
    avatar: 'https://unavatar.io/twitter/kaicenat',
    category: 'Gaming',
    verified: true,
  },
  {
    id: 'cr7',
    name: 'Sneako',
    handle: '@sneako',
    platforms: ['Twitter', 'Rumble', 'YouTube'],
    baseScore: 81,
    avatar: 'https://unavatar.io/twitter/sneako',
    category: 'Commentary',
    verified: true,
  },
  {
    id: 'cr8',
    name: 'Hasan Piker',
    handle: '@hasanthehun',
    platforms: ['Twitch', 'Twitter', 'YouTube'],
    baseScore: 87,
    avatar: 'https://unavatar.io/twitter/hasanthehun',
    category: 'Politics',
    verified: true,
  },
  {
    id: 'cr9',
    name: 'Pokimane',
    handle: '@pokimanelol',
    platforms: ['Twitch', 'Twitter', 'YouTube'],
    baseScore: 88,
    avatar: 'https://unavatar.io/twitter/pokimanelol',
    category: 'Gaming',
    verified: true,
  },
  {
    id: 'cr10',
    name: 'xQc',
    handle: '@xqc',
    platforms: ['Twitch', 'Twitter', 'YouTube'],
    baseScore: 90,
    avatar: 'https://unavatar.io/twitter/xqc',
    category: 'Gaming',
    verified: true,
  },
  {
    id: 'cr11',
    name: 'Iman Gadzhi',
    handle: '@GadzhiIman',
    platforms: ['Twitter', 'YouTube', 'Instagram'],
    baseScore: 79,
    avatar: 'https://unavatar.io/twitter/GadzhiIman',
    category: 'Business',
    verified: true,
  },
  {
    id: 'cr12',
    name: 'Fresh & Fit',
    handle: '@FreshandFit',
    platforms: ['YouTube', 'Twitter', 'Rumble'],
    baseScore: 77,
    avatar: 'https://unavatar.io/twitter/FreshandFit',
    category: 'Podcast',
    verified: true,
  },
];

// Updated weighting formula - Search/Trends weighted highest
export const METRIC_WEIGHTS = {
  googleTrends: 0.35,      // Increased - search indicates real interest
  twitterMentions: 0.30,   // High weight - mentions show engagement
  redditDiscussions: 0.20, // Medium - shows community discussion
  youtubeViews: 0.15,      // Lower - views can be manipulated easier
};

// Generate historical data for reach scores
export const generateHistoricalData = (baseScore: number, hours = 24) => {
  const data = [];
  let score = baseScore - Math.random() * 15;
  
  for (let i = 0; i < hours; i++) {
    // More realistic fluctuation
    const volatility = Math.random() * 10 - 4.5;
    score = Math.max(20, Math.min(100, score + volatility));
    
    data.push({
      timestamp: new Date(Date.now() - (hours - i) * 60 * 60 * 1000).toISOString(),
      score: Math.round(score * 10) / 10,
      googleTrends: Math.floor(Math.random() * 100) + 20,
      twitterMentions: Math.floor(Math.random() * 1000) + 200,
      redditPosts: Math.floor(Math.random() * 50) + 10,
      youtubeViews: Math.floor(Math.random() * 50000) + 5000,
    });
  }
  
  return data;
};

// Calculate reach score with new weights
export const calculateReachScore = (metrics: {
  googleTrends: number;
  twitterMentions: number;
  redditPosts: number;
  youtubeViews: number;
  confidence?: number;
}) => {
  const {
    googleTrends,
    twitterMentions,
    redditPosts,
    youtubeViews,
    confidence = 1.0,
  } = metrics;

  // Normalize each metric to 0-100 scale
  const normGoogleTrends = Math.min(100, (googleTrends / 100) * 100);
  const normTwitter = Math.min(100, (twitterMentions / 1000) * 100);
  const normReddit = Math.min(100, (redditPosts / 100) * 100);
  const normYouTube = Math.min(100, (youtubeViews / 100000) * 100);

  // Apply weights
  const score =
    METRIC_WEIGHTS.googleTrends * normGoogleTrends +
    METRIC_WEIGHTS.twitterMentions * normTwitter +
    METRIC_WEIGHTS.redditDiscussions * normReddit +
    METRIC_WEIGHTS.youtubeViews * normYouTube;

  return score * confidence;
};

// Calculate odds based on current score vs threshold
export const calculateOdds = (currentScore: number, threshold: number): number => {
  const diff = threshold - currentScore;
  const baseOdds = 2.0;
  const adjustment = diff / 40; // Adjusted for sensitivity
  return Math.max(1.05, Math.min(20, baseOdds + adjustment));
};

// Calculate dynamic multiplier
export const calculateMultiplier = (startScore: number, currentScore: number): number => {
  if (currentScore <= startScore) return 1.0;
  return Math.log2(1 + currentScore / startScore) * 1.5;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format time
export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default {
  TRENDING_CREATORS,
  METRIC_WEIGHTS,
  generateHistoricalData,
  calculateReachScore,
  calculateOdds,
  calculateMultiplier,
  formatCurrency,
  formatTime,
  formatRelativeTime,
};
