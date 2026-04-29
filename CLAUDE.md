@AGENTS.md

---

# DevTier 개발 명세서

## 서비스 개요

| 항목 | 내용 |
| --- | --- |
| 서비스명 | DevTier |
| 도메인 | devtier.dev |
| 핵심 컨셉 | GitHub 잔디(contribution) 데이터로 한국 개발자 전투력을 측정하고 티어를 부여 |
| 타겟 유저 | GitHub를 사용하는 한국 개발자 |
| 바이럴 전략 | GitHub README 뱃지 삽입 → 프로필 방문자 자연 유입 |

## 기술 스택

| 구성 | 기술 |
| --- | --- |
| 프론트 + 백엔드 | Next.js 14 (App Router, Vercel 배포) |
| DB | Supabase (PostgreSQL) |
| GitHub 데이터 | GitHub GraphQL API |
| 뱃지 | SVG 동적 생성 |
| 인증 | GitHub Personal Access Token (환경변수) |

## 페이지 구조

### 1. 메인 페이지 `/`
- GitHub 아이디 입력창 (검색 폼)
- 입력 후 결과 페이지로 이동
- 전체 랭킹 테이블 (하단)
  - 순위 / GitHub 아이디 / 티어 / 전투력 점수 표시
  - 최대 100명 표시

### 2. 결과 페이지 `/result/[username]`
- 티어 카드 (티어명 + 티어 숫자 + 티어 색상)
- 전투력 점수 및 세부 지표
  - 총 잔디 수 / 현재 연속 스트릭 / 최대 스트릭 / 잔디 밀도(%) / 피크 강도
- 백분위 표시 ("수집된 한국 개발자 상위 N%")
- 뱃지 코드 복사 버튼: `![DevTier](https://devtier.dev/api/badge/깃헙아이디)`
- 주의 문구: "GitHub location을 한국으로 설정한 유저 기준 백분위입니다"

## DB 스키마 (Supabase)

단일 `users` 테이블에 모든 데이터 저장:

```sql
CREATE TABLE users (
  id                    SERIAL PRIMARY KEY,
  github_id             TEXT UNIQUE NOT NULL,
  score                 INTEGER NOT NULL DEFAULT 0,
  total_contributions   INTEGER,
  current_streak        INTEGER,
  longest_streak        INTEGER,
  contribution_density  FLOAT,
  peak_intensity        INTEGER,
  percentile            FLOAT,
  tier                  TEXT,
  tier_rank             INTEGER,
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

## 티어 구조

| 티어 | 기준 | 색상 |
| --- | --- | --- |
| 챌린저 | 상위 100명 (절대 인원 고정) | `#FF4655` |
| 다이아 1~4 | 상위 1~5% | `#56C8D8` |
| 플래티넘 1~4 | 상위 5~15% | `#5AC9A6` |
| 골드 1~4 | 상위 15~30% | `#FFD700` |
| 실버 1~4 | 상위 30~50% | `#C0C0C0` |
| 브론즈 1~4 | 상위 50~100% | `#CD7F32` |

- 티어 내 숫자 낮을수록 높은 등급 (1이 최고, 4가 최저)
- 챌린저는 백분위가 아닌 절대 인원 100명 고정 → 별도 처리 필요

## 전투력 점수 계산 공식

```
score =
  총 잔디 수           × 1
  + 현재 연속 스트릭   × 3
  + 최대 스트릭        × 2
  + 잔디 밀도(%)       × 100
  + 피크 강도          × 0.5
```

## API 명세

### `GET /api/score/[username]`
GitHub GraphQL API로 잔디 조회 → 점수·티어 계산 → DB upsert → JSON 반환

**Response:**
```json
{
  "github_id": "string",
  "score": 1234,
  "tier": "gold",
  "tier_rank": 2,
  "percentile": 22.5,
  "details": {
    "total_contributions": 800,
    "current_streak": 15,
    "longest_streak": 42,
    "contribution_density": 0.73,
    "peak_intensity": 28
  }
}
```

### `GET /api/badge/[username]`
- Content-Type: `image/svg+xml`
- Cache-Control: `public, max-age=3600`
- 티어별 색상 적용
- 뱃지 형식: `DevTier | 골드 2 | 1234점`

### `GET /api/ranking`
DB 전체 유저 랭킹 반환 (최대 100명)

**Response:**
```json
[{ "rank": 1, "github_id": "string", "score": 9999, "tier": "challenger", "tier_rank": null }]
```

## 한국 유저 수집 배치

쿼리 4종 조합, 각 최대 1,000명, 중복 제거 후 약 3,000~4,000명:
- `location:Korea sort:followers`
- `location:Korea sort:repositories`
- `location:Seoul sort:followers`
- `location:한국 sort:followers`

배치 동작:
1. GitHub Search API로 유저 목록 수집
2. 중복 제거 후 `users` 테이블에 upsert
3. GitHub GraphQL API로 각 유저 잔디 데이터 수집
4. 전투력 점수 계산 후 DB 업데이트
5. 백분위 및 티어 전체 재산출 후 업데이트

실행 주기: 주 1회 (Vercel Cron Job 또는 수동)

## 환경변수

```
GITHUB_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## 주요 제약사항

- GitHub Search API 쿼리당 최대 1,000명 하드캡 → 키워드 조합으로 모수 확보
- 백분위는 "수집된 유저 기준"임을 프론트에서 반드시 명시
- 뱃지 API는 GitHub README 삽입용이므로 반드시 `Cache-Control` 헤더 설정
- 챌린저 100명은 score 내림차순 절대 순위 기준으로 별도 분기 처리
