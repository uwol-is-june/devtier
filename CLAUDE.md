@AGENTS.md

---

# DevTier 프로젝트 컨텍스트

## 서비스 목적
GitHub 잔디 데이터로 한국 개발자 전투력을 측정하고 티어를 부여. 뱃지를 통한 바이럴 확산이 핵심.

## API 엔드포인트 구조

| 엔드포인트 | 역할 |
| --- | --- |
| `GET /api/score/[username]` | GitHub GraphQL로 잔디 조회 → 점수 계산 → DB 백분위 기준 티어 반환 |
| `GET /api/badge/[username]` | 유저 티어 조회 후 SVG 동적 생성 반환, `Cache-Control: max-age=3600` |

## 티어 계산 로직

- DB에 수집된 한국 개발자 모집단 기준 백분위로 티어 결정
- 챌린저: 상위 100명 (절대 인원)
- 다이아 1~4: 상위 1~5% → 4등분
- 플래티넘 1~4: 상위 5~15% → 4등분
- 골드 1~4: 상위 15~30% → 4등분
- 실버 1~4: 상위 30~50% → 4등분
- 브론즈 1~4: 상위 50~100% → 4등분
- 같은 티어 내 숫자 낮을수록 높은 등급

## 전투력 점수 지표 (POC)

| 지표 | 가중치 기준 |
| --- | --- |
| 총 잔디 수 (최근 1년) | 핵심 지표 |
| 연속 스트릭 (현재) | 보조 지표 |
| 최대 스트릭 (역대) | 보조 지표 |
| 잔디 밀도 (커밋한 날 / 365) | 보조 지표 |
| 피크 강도 (하루 최대 커밋) | 보조 지표 |

## 한국 유저 수집 전략

GitHub Search API로 아래 쿼리 조합 → 중복 제거 → Supabase 저장:
- `location:Korea sort:followers`
- `location:Korea sort:repositories`
- `location:Seoul sort:followers`
- `location:한국 sort:followers`

쿼리당 최대 1,000명 하드캡 → 약 3,000~4,000명 확보. 주 1회 업데이트.

## Supabase DB 테이블 (예정)

- `users` — GitHub 유저 목록 (login, location, collected_at)
- `scores` — 전투력 점수 (username, total_contributions, streak, max_streak, density, peak, score, tier, percentile, updated_at)

## 환경변수

```
GITHUB_TOKEN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
