-- Phase 1: 도전과제 시스템 DB 마이그레이션

-- 1. users 테이블에 created_at 추가 (얼리어답터 판단용)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE users SET created_at = updated_at WHERE created_at IS NULL;

-- 2. achievements 마스터 테이블
CREATE TABLE IF NOT EXISTS achievements (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  name_ko     TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity      TEXT NOT NULL,
  icon        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 3. user_achievements 연결 테이블
CREATE TABLE IF NOT EXISTS user_achievements (
  github_id      TEXT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (github_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_github_id_idx
  ON user_achievements(github_id);
CREATE INDEX IF NOT EXISTS user_achievements_achievement_id_idx
  ON user_achievements(achievement_id);

-- 4. 30개 도전과제 시드 데이터
INSERT INTO achievements (id, category, name_ko, description, rarity, icon, sort_order) VALUES
  -- 잔디 기반 (activity)
  ('activity_100',  'activity', '첫 삽질',      '총 잔디 100개 이상',    'common',    '🌱', 10),
  ('activity_365',  'activity', '일년치',        '총 잔디 365개 이상',    'common',    '🌿', 11),
  ('activity_1000', 'activity', '잔디 컬렉터',   '총 잔디 1,000개 이상',  'rare',      '🌳', 12),
  ('activity_3000', 'activity', '잔디밭 주인',   '총 잔디 3,000개 이상',  'epic',      '🌲', 13),
  ('activity_5000', 'activity', '잔디의 신',     '총 잔디 5,000개 이상',  'legendary', '🏆', 14),
  ('streak_7',      'activity', '주간 전사',     '최대 스트릭 7일 이상',   'common',    '🔥', 20),
  ('streak_30',     'activity', '월간 전사',     '최대 스트릭 30일 이상',  'rare',      '🔥', 21),
  ('streak_100',    'activity', '세 자리 스트릭', '최대 스트릭 100일 이상', 'epic',      '⚡', 22),
  ('streak_365',    'activity', '불꽃 개발자',   '최대 스트릭 365일 이상', 'legendary', '♾️', 23),
  ('density_80',    'activity', '빽빽한 잔디밭', '잔디 밀도 80% 이상',    'rare',      '📅', 30),
  ('density_95',    'activity', '쉬지 않는 자',  '잔디 밀도 95% 이상',    'epic',      '💎', 31),
  -- 티어 기반 (tier)
  ('tier_bronze',     'tier', '등록 완료',   '브론즈 티어 달성',     'common',    '🥉', 40),
  ('tier_silver',     'tier', '중상급 개발자', '실버 티어 달성',     'common',    '🥈', 41),
  ('tier_gold',       'tier', '골드 러너',   '골드 티어 달성',      'rare',      '🥇', 42),
  ('tier_platinum',   'tier', '엘리트 코더', '플래티넘 티어 달성',   'rare',      '💠', 43),
  ('tier_diamond',    'tier', '다이아 클래스', '다이아 티어 달성',   'epic',      '🔷', 44),
  ('tier_challenger', 'tier', '챌린저 등극', '챌린저 달성',         'legendary', '👑', 45),
  ('rank_top10',      'tier', '탑 10',      '전체 순위 10위 이내',  'legendary', '🎯', 46),
  -- 특이 패턴 (pattern)
  ('peak_50',        'pattern', '미친 생산성',    '하루 최대 커밋 50개 이상',                   'rare',      '📈', 50),
  ('peak_100',       'pattern', '커밋 머신',      '하루 최대 커밋 100개 이상',                  'epic',      '💥', 51),
  ('star_100',       'pattern', '별 수집가',      '레포 스타 합계 100개 이상',                  'rare',      '⭐', 52),
  ('star_1000',      'pattern', '오픈소스 스타',  '레포 스타 합계 1,000개 이상',                'epic',      '🌟', 53),
  ('star_10000',     'pattern', '스타 레전드',    '레포 스타 합계 10,000개 이상',               'legendary', '💫', 54),
  ('sprint_style',   'pattern', '몰아치기 스타일', '잔디 밀도 30% 미만이지만 피크 강도 30 이상', 'rare',      '⚡', 55),
  ('marathon_style', 'pattern', '마라토너',       '잔디 밀도 80% 이상이고 최대 스트릭 100일 이상', 'epic',   '🏃', 56),
  -- 소셜 / 바이럴 (social)
  ('first_scan',    'social', '첫 번째 스캔', 'DevTier 최초 등록',              'common', '👋', 60),
  ('early_adopter', 'social', '얼리어답터',   '서비스 오픈 후 30일 이내 등록',   'rare',   '🚀', 61),
  ('badge_live',    'social', '뱃지 달기',    'GitHub README에 뱃지가 달렸음',   'common', '🏅', 62)
ON CONFLICT (id) DO NOTHING;
