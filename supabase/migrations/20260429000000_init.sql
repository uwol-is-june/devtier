create table public.users (
  id                    serial primary key,
  github_id             text unique not null,
  score                 integer not null default 0,
  total_contributions   integer,
  current_streak        integer,
  longest_streak        integer,
  contribution_density  float,
  peak_intensity        integer,
  percentile            float,
  tier                  text,
  tier_rank             integer,
  updated_at            timestamptz default now()
);

create index users_score_idx on public.users(score desc);
