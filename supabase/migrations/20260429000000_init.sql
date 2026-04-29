create table public.users (
  id bigint generated always as identity primary key,
  login text not null unique,
  location text,
  collected_at timestamptz default now()
);

create table public.scores (
  id bigint generated always as identity primary key,
  username text not null unique,
  total_contributions int default 0,
  current_streak int default 0,
  max_streak int default 0,
  density float default 0,
  peak_day int default 0,
  score float default 0,
  tier text default 'bronze4',
  percentile float default 100,
  updated_at timestamptz default now()
);

create index scores_score_idx on public.scores(score desc);
