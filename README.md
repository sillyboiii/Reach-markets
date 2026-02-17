# ReachMarkets - Creator Prediction Platform

A real-time prediction market platform where users can bet on creator virality and reach scores.

## Features

- 🔴 Live reach score tracking with real social media data
- 📊 Dynamic odds calculation based on current metrics
- 🎯 Over/under betting markets
- 📈 Real-time charts and analytics
- 🔒 Anti-manipulation systems with confidence scoring

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **APIs**: Twitter, YouTube, Reddit, Google Trends

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reach-markets.git
cd reach-markets
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Twitter Bearer Token (get from [Twitter Developer Portal](https://developer.twitter.com))
- YouTube API Key (get from [Google Cloud Console](https://console.cloud.google.com))
- Reddit API credentials (get from [Reddit Apps](https://www.reddit.com/prefs/apps))

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/reach-markets)

### Environment Variables on Vercel

Add these in your Vercel project settings:
- `TWITTER_BEARER_TOKEN`
- `YOUTUBE_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `GOOGLE_TRENDS_API_KEY`

## API Keys Setup

### Twitter API
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Generate Bearer Token
4. Add to `.env.local`

### YouTube API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create credentials (API Key)
4. Add to `.env.local`

### Reddit API
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Create a new app (script type)
3. Copy client ID and secret
4. Add to `.env.local`

## Project Structure

```
reach-markets/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Next.js pages
│   ├── utils/          # Utility functions
│   └── hooks/          # Custom React hooks
├── public/             # Static assets
└── package.json
```

## How It Works

1. **Data Collection**: Bot scrapes Twitter mentions, YouTube clips, Reddit posts, and Google Trends
2. **Score Calculation**: Weighted formula calculates reach score:
   - Google Trends: 35% (highest weight)
   - Twitter Mentions: 30%
   - Reddit Discussions: 20%
   - YouTube Views: 15%
3. **Market Updates**: Odds adjust in real-time based on score changes
4. **Anti-Manipulation**: Confidence scoring and anomaly detection

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Support

For support, email support@reachmarkets.com or open an issue.
