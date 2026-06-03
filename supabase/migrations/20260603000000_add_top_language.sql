ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS top_language TEXT GENERATED ALWAYS AS
    (top_languages->0->>'name') STORED;

CREATE INDEX IF NOT EXISTS idx_users_top_language ON public.users (top_language);
