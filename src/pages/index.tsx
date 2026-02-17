import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Search,
  Filter,
  Activity,
} from 'lucide-react';
import {
  TRENDING_CREATORS,
  generateHistoricalData,
  calculateOdds,
  formatCurrency,
  formatTime,
  formatRelativeTime,
} from '@/utils/data';

interface Creator {
  id: string;
  name: string;
  handle: string;
  platforms: string[];
  baseScore: number;
  currentScore: number;
  avatar: string;
  category: string;
  verified: boolean;
  trend: 'up' | 'down';
  history: any[];
  confidence: number;
  lastUpdate: Date;
}

interface Market {
  id: string;
  creatorId: string;
  creatorName: string;
  type: string;
  threshold: number;
  currentOdds: number;
  totalStaked: number;
  startTime: Date;
  endTime: Date;
  status: string;
}

export default function MarketsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('volume'); // volume, score, trending

  // Initialize creators and markets
  useEffect(() => {
    const initialCreators = TRENDING_CREATORS.map((creator) => ({
      ...creator,
      history: generateHistoricalData(creator.baseScore),
      currentScore: creator.baseScore,
      trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down',
      confidence: 0.85 + Math.random() * 0.15,
      lastUpdate: new Date(),
    }));
    setCreators(initialCreators);

    const initialMarkets = initialCreators.map((creator) => ({
      id: `mkt-${creator.id}`,
      creatorId: creator.id,
      creatorName: creator.name,
      type: 'over_under',
      threshold: 75,
      currentOdds: calculateOdds(creator.currentScore, 75),
      totalStaked: Math.floor(Math.random() * 100000) + 20000,
      startTime: new Date(Date.now() - 3600000 * 12),
      endTime: new Date(Date.now() + 3600000 * 12),
      status: 'active',
    }));
    setMarkets(initialMarkets);
  }, []);

  // Live updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCreators((prev) =>
        prev.map((creator) => {
          const change = (Math.random() - 0.48) * 5;
          const newScore = Math.max(20, Math.min(100, creator.currentScore + change));

          return {
            ...creator,
            currentScore: newScore,
            trend: change > 0 ? 'up' : 'down',
            lastUpdate: new Date(),
          };
        })
      );

      setMarkets((prev) =>
        prev.map((market) => {
          const creator = creators.find((c) => c.id === market.creatorId);
          if (creator) {
            return {
              ...market,
              currentOdds: calculateOdds(creator.currentScore, market.threshold),
            };
          }
          return market;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [creators]);

  // Filter creators
  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort creators
  const sortedCreators = [...filteredCreators].sort((a, b) => {
    if (sortBy === 'volume') {
      const marketA = markets.find((m) => m.creatorId === a.id);
      const marketB = markets.find((m) => m.creatorId === b.id);
      return (marketB?.totalStaked || 0) - (marketA?.totalStaked || 0);
    }
    if (sortBy === 'score') {
      return b.currentScore - a.currentScore;
    }
    if (sortBy === 'trending') {
      const changeA =
        a.currentScore - (a.history[0]?.score || a.currentScore);
      const changeB =
        b.currentScore - (b.history[0]?.score || b.currentScore);
      return changeB - changeA;
    }
    return 0;
  });

  const categories = ['All', ...Array.from(new Set(creators.map((c) => c.category)))];

  return (
    <div style={{ minHeight: '100vh', background: '#0f1419', color: '#e5e7eb' }}>
      <style>{`
        .market-card {
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .market-card:hover {
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(55, 65, 81, 0.5);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
          background: 'rgba(15, 20, 25, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 600,
                color: '#f9fafb',
                letterSpacing: '-0.5px',
              }}
            >
              ReachMarkets
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  border: '1px solid rgba(55, 65, 81, 0.3)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Activity size={16} style={{ color: '#34d399' }} />
                <span style={{ fontWeight: 500, color: '#f9fafb', fontSize: '14px' }}>
                  {markets.length} Live Markets
                </span>
              </div>
              <button
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#f9fafb' }}>
            Markets
          </h2>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  color: '#e5e7eb',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '8px',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(55, 65, 81, 0.5)',
                color: '#e5e7eb',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              <option value="volume">Volume</option>
              <option value="score">Score</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="badge"
                style={{
                  background:
                    selectedCategory === category
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(31, 41, 55, 0.6)',
                  color: selectedCategory === category ? '#818cf8' : '#9ca3af',
                  border: `1px solid ${
                    selectedCategory === category
                      ? 'rgba(99, 102, 241, 0.4)'
                      : 'rgba(55, 65, 81, 0.3)'
                  }`,
                  cursor: 'pointer',
                  padding: '8px 16px',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Market Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {sortedCreators.map((creator) => {
            const market = markets.find((m) => m.creatorId === creator.id);
            if (!market) return null;

            const yesPrice = (1 / market.currentOdds) * 100;
            const noPrice = 100 - yesPrice;

            return (
              <div
                key={creator.id}
                className="market-card"
                onClick={() => router.push(`/market/${creator.id}`)}
              >
                {/* Creator Info */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <img src={creator.avatar} alt={creator.name} className="avatar" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>
                        {creator.name}
                      </h3>
                      {creator.verified && (
                        <span style={{ color: '#3b82f6', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                      {creator.handle}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {creator.platforms.slice(0, 3).map((platform) => (
                        <span
                          key={platform}
                          className="badge"
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
                      {creator.currentScore.toFixed(0)}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: creator.trend === 'up' ? '#34d399' : '#f87171',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {creator.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(creator.currentScore - (creator.history[0]?.score || creator.currentScore)).toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Market Question */}
                <div
                  style={{
                    padding: '16px 0',
                    borderTop: '1px solid rgba(55, 65, 81, 0.3)',
                    borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '12px', fontWeight: 500 }}>
                    Will reach score go over {market.threshold} by {formatTime(market.endTime)}?
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        YES
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#34d399' }}>
                        {yesPrice.toFixed(0)}¢
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        NO
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#f87171' }}>
                        {noPrice.toFixed(0)}¢
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={14} />
                    {formatCurrency(market.totalStaked)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {formatRelativeTime(market.lastUpdate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
