CREATE TABLE batch_logs (
  id           SERIAL PRIMARY KEY,
  run_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total        INTEGER     NOT NULL,
  updated      INTEGER     NOT NULL,
  skipped      INTEGER     NOT NULL,
  duration_sec INTEGER     NOT NULL
);
