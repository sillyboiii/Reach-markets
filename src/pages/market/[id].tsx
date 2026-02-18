import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TRENDING_CREATORS,
  generateHistoricalData,
  calculateOdds,
  formatCurrency,
  formatTime,
} from '@/utils/data';

export default function MarketPage() {
  const router = useRouter();
  const { id } = router.query;

  const [creator, setCreator] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [balance, setBalance] = useState(10000);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [tab, setTab] = useState<'trade' | 'info'>('trade');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadCreator = async () => {
      try {
        const res = await fetch('/api/creators');
        if (res.ok) {
          const { creators } = await res.json();
          const found = creators?.find((c: any) => c.id === id);
          if (found) {
            const enriched = {
              ...found,
              history: found.history.length > 0 ? found.history : generateHistoricalData(found.baseScore),
              trend: Math.random() > 0.5 ? 'up' : 'down',
              confidence: 0.85 + Math.random() * 0.15,
              lastUpdate: new Date(),
            };
            setCreator(enriched);
            setIsLive(found.history.length > 0);
            setMarket({
              id: `mkt-${found.id}`,
              creatorId: found.id,
              creatorName: found.name,
              type: 'over_under',
              threshold: 75,
              currentOdds: calculateOdds(found.currentScore, 75),
              totalStaked: Math.floor(Math.random() * 100000) + 20000,
              startTime: new Date(Date.now() - 3600000 * 12),
              endTime: new Date(Date.now() + 3600000 * 12),
              status: 'active',
            });
            return;
          }
        }
      } catch {
        // fall through to mock
      }

      // Mock fallback
      const foundCreator = TRENDING_CREATORS.find((c) => c.id === id);
      if (foundCreator) {
        setCreator({
          ...foundCreator,
          history: generateHistoricalData(foundCreator.baseScore),
          currentScore: foundCreator.baseScore,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          confidence: 0.85 + Math.random() * 0.15,
          lastUpdate: new Date(),
        });
        setMarket({
          id: `mkt-${foundCreator.id}`,
          creatorId: foundCreator.id,
          creatorName: foundCreator.name,
          type: 'over_under',
          threshold: 75,
          currentOdds: calculateOdds(foundCreator.baseScore, 75),
          totalStaked: Math.floor(Math.random() * 100000) + 20000,
          startTime: new Date(Date.now() - 3600000 * 12),
          endTime: new Date(Date.now() + 3600000 * 12),
          status: 'active',
        });
      }
    };

    loadCreator();
  }, [id]);

  // Live score drift every 30s
  useEffect(() => {
    if (!creator) return;
    const interval = setInterval(() => {
      setCreator((prev: any) => {
        const change = (Math.random() - 0.48) * 2;
        const newScore = Math.max(20, Math.min(100, prev.currentScore + change));
        const newHistory = [
          ...prev.history,
          {
            timestamp: new Date().toISOString(),
            score: newScore,
            googleTrends: prev.history[prev.history.length - 1]?.googleTrends ?? 50,
            twitterMentions: prev.history[prev.history.length - 1]?.twitterMentions ?? 200,
            redditPosts: prev.history[prev.history.length - 1]?.redditPosts ?? 10,
            youtubeViews: prev.history[prev.history.length - 1]?.youtubeViews ?? 5000,
          },
        ].slice(-24);
        return { ...prev, currentScore: newScore, history: newHistory, trend: change > 0 ? 'up' : 'down', lastUpdate: new Date() };
      });
      setMarket((prev: any) => {
        if (!prev || !creator) return prev;
        return { ...prev, currentOdds: calculateOdds(creator.currentScore, prev.threshold) };
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [creator]);

  const placeBet = (type: 'over' | 'under') => {
    if (!market || betAmount > balance) return;
    const odds = type === 'over' ? market.currentOdds : 1 / market.currentOdds;
    setUserBets((prev) => [
      ...prev,
      {
        id: `bet-${Date.now()}`,
        type,
        stake: betAmount,
        odds,
        potentialPayout: betAmount * odds,
        placedAt: new Date(),
        status: 'active',
        currentScore: creator?.currentScore || 0,
      },
    ]);
    setBalance((prev) => prev - betAmount);
  };

  if (!creator || !market) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e5e7eb' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const yesPrice = (1 / market.currentOdds) * 100;
  const noPrice = 100 - yesPrice;
  const latest = creator.history[creator.history.length - 1];

  return (
    <div style={{ minHeight: '100vh', background: '#0f1419', color: '#e5e7eb' }}>
      <style>{`
        .glass-card { background: rgba(17, 24, 39, 0.8); border: 1px solid rgba(55, 65, 81, 0.3); border-radius: 12px; backdrop-filter: blur(12px); }
        .bet-button { background: transparent; border: 1.5px solid rgba(55, 65, 81, 0.5); color: #e5e7eb; padding: 16px; border-radius: 10px; font-family: inherit; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.2s ease; }
        .bet-button.yes { border-color: rgba(52, 211, 153, 0.4); }
        .bet-button.yes:hover { border-color: rgba(52, 211, 153, 0.6); background: rgba(52, 211, 153, 0.08); }
        .bet-button.no { border-color: rgba(248, 113, 113, 0.4); }
        .bet-button.no:hover { border-color: rgba(248, 113, 113, 0.6); background: rgba(248, 113, 113, 0.08); }
        .tab-button { background: transparent; border: none; color: #9ca3af; padding: 12px 24px; font-size: 15px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
        .tab-button.active { color: #f9fafb; border-bottom-color: #6366f1; }
        input[type="number"] { background: rgba(31, 41, 55, 0.8); border: 1px solid rgba(55, 65, 81, 0.5); color: #e5e7eb; padding: 12px 16px; border-radius: 8px; font-size: 15px; width: 100%; }
        input[type="number"]:focus { outline: none; border-color: rgba(99, 102, 241, 0.6); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)', background: 'rgba(15, 20, 25, 0.95)', backdropFilter: 'blur(12px)', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#f9fafb' }}>ReachMarkets</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isLive ? '#34d399' : '#f59e0b' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#34d399' : '#f59e0b' }} />
              {isLive ? 'Live data' : 'Mock data'}
            </div>
            <div style={{ background: 'rgba(31, 41, 55, 0.6)', border: '1px solid rgba(55, 65, 81, 0.3)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} style={{ color: '#34d399' }} />
              <span style={{ fontWeight: 600, color: '#f9fafb' }}>{formatCurrency(balance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Creator Header */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <img src={creator.avatar} alt={creator.name} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(55, 65, 81, 0.5)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#f9fafb' }}>{creator.name}</h2>
                  {creator.verified && <span style={{ color: '#3b82f6', fontSize: '20px' }}>✓</span>}
                  {isLive && <span style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>LIVE</span>}
                </div>
                <div style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '12px' }}>{creator.handle}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {creator.platforms.map((platform: string) => (
                    <span key={platform} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                      {platform}
                    </span>
                  ))}
                  <span style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                    {creator.category}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#f9fafb', marginBottom: '8px' }}>
                  {creator.currentScore.toFixed(0)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: creator.trend === 'up' ? '#34d399' : '#f87171', fontSize: '16px', fontWeight: 500, justifyContent: 'flex-end' }}>
                  {creator.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  {Math.abs(creator.currentScore - (creator.history[0]?.score || creator.currentScore)).toFixed(1)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '16px', color: '#d1d5db', fontWeight: 500 }}>
              Will reach score go over {market.threshold} by {formatTime(market.endTime)}?
            </div>
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)', marginBottom: '24px' }}>
            <button onClick={() => setTab('trade')} className={`tab-button ${tab === 'trade' ? 'active' : ''}`}>Trade</button>
            <button onClick={() => setTab('info')} className={`tab-button ${tab === 'info' ? 'active' : ''}`}>Info</button>
          </div>

          {tab === 'trade' ? (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>Reach Score History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={creator.history.slice(-24)}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(55, 65, 81, 0.5)', borderRadius: '8px', color: '#e5e7eb' }}
                    labelFormatter={(val) => new Date(val).toLocaleTimeString()}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Google Trends</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>{latest?.googleTrends ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Mentions</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>{latest?.twitterMentions ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Reddit Posts</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>{latest?.redditPosts ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>YT Views</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>{((latest?.youtubeViews ?? 0) / 1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>Market Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                {[
                  ['Total volume', formatCurrency(market.totalStaked)],
                  ['Market closes', formatTime(market.endTime)],
                  ['Confidence score', `${(creator.confidence * 100).toFixed(0)}%`],
                  ['Threshold', String(market.threshold)],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(55, 65, 81, 0.2)' }}>
                    <span style={{ color: '#9ca3af' }}>{label}</span>
                    <span style={{ color: '#f9fafb', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>Place Order</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                max={balance}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <button className="bet-button yes" onClick={() => placeBet('over')} disabled={betAmount > balance}>
                <div style={{ marginBottom: '6px', fontSize: '13px', opacity: 0.8 }}>Buy YES</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{yesPrice.toFixed(0)}¢</div>
              </button>
              <button className="bet-button no" onClick={() => placeBet('under')} disabled={betAmount > balance}>
                <div style={{ marginBottom: '6px', fontSize: '13px', opacity: 0.8 }}>Buy NO</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f87171' }}>{noPrice.toFixed(0)}¢</div>
              </button>
            </div>
            <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#9ca3af' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Avg price</span>
                <span style={{ color: '#f9fafb', fontWeight: 500 }}>{yesPrice.toFixed(0)}¢</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Potential payout</span>
                <span style={{ color: '#34d399', fontWeight: 500 }}>{formatCurrency(betAmount)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#f9fafb' }}>Your Positions ({userBets.length})</h3>
            {userBets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6b7280', fontSize: '14px' }}>No positions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userBets.map((bet) => (
                  <div key={bet.id} style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(55, 65, 81, 0.3)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#f9fafb' }}>{bet.type === 'over' ? 'YES' : 'NO'}</span>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: bet.type === 'over' ? '#34d399' : '#f87171' }}>{formatCurrency(bet.stake)}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Potential: {formatCurrency(bet.potentialPayout)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
