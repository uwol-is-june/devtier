CREATE TABLE IF NOT EXISTS public.score_history (
  github_id    TEXT NOT NULL REFERENCES public.users(github_id) ON DELETE CASCADE,
  score        INTEGER NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (github_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_score_history_github_id ON public.score_history (github_id, recorded_at DESC);
