# ReachMarkets - Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Click the button below:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/reach-markets)

2. Vercel will prompt you to add environment variables. Add:
   - `TWITTER_BEARER_TOKEN`
   - `YOUTUBE_API_KEY`
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `GOOGLE_TRENDS_API_KEY`

3. Click "Deploy"

### Option 2: Manual Deploy

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project root:
```bash
cd reach-markets
vercel
```

4. Follow the prompts and add environment variables when asked

5. For production deployment:
```bash
vercel --prod
```

## Environment Variables Setup

Add these in your Vercel project settings (Settings > Environment Variables):

### Required Variables

- **TWITTER_BEARER_TOKEN**: Get from [Twitter Developer Portal](https://developer.twitter.com)
- **YOUTUBE_API_KEY**: Get from [Google Cloud Console](https://console.cloud.google.com)
- **REDDIT_CLIENT_ID**: Get from [Reddit Apps](https://www.reddit.com/prefs/apps)
- **REDDIT_CLIENT_SECRET**: From same Reddit Apps page

### Optional Variables

- **GOOGLE_TRENDS_API_KEY**: If you have a third-party trends service
- **DATABASE_URL**: For production database (optional)
- **NEXTAUTH_URL**: Your production URL
- **NEXTAUTH_SECRET**: Random string for auth

## GitHub Setup

1. Create a new repository on GitHub:
```bash
cd reach-markets
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/reach-markets.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

## Post-Deployment

After deployment:

1. Test all API endpoints work correctly
2. Verify live data is updating every 30 seconds
3. Check that creator avatars load properly
4. Test betting functionality
5. Monitor Vercel logs for any errors

## Troubleshooting

### API Keys Not Working
- Verify keys are correctly added in Vercel environment variables
- Check API quotas haven't been exceeded
- Ensure keys have proper permissions

### Build Errors
- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Clear Vercel cache and redeploy

### Data Not Updating
- Check API endpoints in browser dev tools
- Verify WebSocket connections (if implemented)
- Check rate limits on external APIs

## Scaling

For production use:

1. **Add Database**: Use PostgreSQL or MongoDB for persistent data
2. **Add Caching**: Use Redis for API response caching
3. **Rate Limiting**: Implement rate limits on your API routes
4. **Authentication**: Add user accounts with NextAuth
5. **Real-time Updates**: Replace polling with WebSockets

## Cost Optimization

- Use Vercel's free tier for development
- Monitor API usage to stay within free quotas
- Implement caching to reduce API calls
- Consider serverless database options

## Support

For issues:
1. Check Vercel logs
2. Review API documentation
3. Open an issue on GitHub
4. Contact support@reachmarkets.com
