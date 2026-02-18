-- ReachMarkets Database Schema
-- Run this once in the Supabase SQL Editor (https://supabase.com/dashboard/project/hxkwcjxsxooqyfxtdrmo/sql)

-- Creators table
create table if not exists creators (
  id text primary key,
  name text not null,
  handle text not null,
  platforms text[] not null default '{}',
  base_score numeric not null default 50,
  avatar text,
  category text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Creator metrics table (one row per creator per sync)
create table if not exists creator_metrics (
  id bigint generated always as identity primary key,
  creator_id text not null references creators(id) on delete cascade,
  google_trends numeric not null default 0,
  twitter_mentions integer not null default 0,
  reddit_posts integer not null default 0,
  youtube_views bigint not null default 0,
  reach_score numeric not null default 0,
  synced_at timestamptz not null default now()
);

-- Index for fast lookup of latest metrics per creator
create index if not exists idx_creator_metrics_creator_synced
  on creator_metrics (creator_id, synced_at desc);

-- View: latest metrics per creator
create or replace view creator_latest_metrics as
select distinct on (creator_id)
  cm.*
from creator_metrics cm
order by creator_id, synced_at desc;

-- Seed creators
insert into creators (id, name, handle, platforms, base_score, avatar, category, verified) values
  ('cr1',  'Clavicular',    '@clavicular_',  array['Twitter','YouTube','TikTok'],         89, 'https://unavatar.io/twitter/clavicular_',   'Lifestyle',     true),
  ('cr2',  'Andrew Tate',   '@Cobratate',    array['Twitter','Instagram','Rumble'],        94, 'https://unavatar.io/twitter/Cobratate',     'Business',      true),
  ('cr3',  'ASU Frat Leader','@asufratstar', array['Twitter','TikTok','Instagram'],        76, 'https://api.dicebear.com/7.x/avataaars/svg?seed=asufrat', 'Viral', false),
  ('cr4',  'Adin Ross',     '@adinross',     array['Kick','Twitter','YouTube'],            91, 'https://unavatar.io/twitter/adinross',      'Gaming',        true),
  ('cr5',  'IShowSpeed',    '@ishowspeed',   array['YouTube','Twitter','TikTok'],          93, 'https://unavatar.io/twitter/ishowspeed',    'Entertainment', true),
  ('cr6',  'Kai Cenat',     '@kaicenat',     array['Twitch','Twitter','YouTube'],          92, 'https://unavatar.io/twitter/kaicenat',     'Gaming',        true),
  ('cr7',  'Sneako',        '@sneako',       array['Twitter','Rumble','YouTube'],          81, 'https://unavatar.io/twitter/sneako',        'Commentary',    true),
  ('cr8',  'Hasan Piker',   '@hasanthehun',  array['Twitch','Twitter','YouTube'],          87, 'https://unavatar.io/twitter/hasanthehun',  'Politics',      true),
  ('cr9',  'Pokimane',      '@pokimanelol',  array['Twitch','Twitter','YouTube'],          88, 'https://unavatar.io/twitter/pokimanelol', 'Gaming',        true),
  ('cr10', 'xQc',           '@xqc',          array['Twitch','Twitter','YouTube'],          90, 'https://unavatar.io/twitter/xqc',          'Gaming',        true),
  ('cr11', 'Iman Gadzhi',   '@GadzhiIman',   array['Twitter','YouTube','Instagram'],       79, 'https://unavatar.io/twitter/GadzhiIman',   'Business',      true),
  ('cr12', 'Fresh & Fit',   '@FreshandFit',  array['YouTube','Twitter','Rumble'],          77, 'https://unavatar.io/twitter/FreshandFit',  'Podcast',       true)
on conflict (id) do nothing;
