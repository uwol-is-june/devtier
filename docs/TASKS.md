# DevTier 개발 태스크

> 세션 간 작업 이어받기용 파일. 각 태스크 완료 시 `[ ]` → `[x]`로 변경.
> 현재 작업 중인 태스크는 `[~]`로 표시.

---

## Phase 0: 환경 세팅

- [x] `.env.local` 환경변수 3종 세팅 확인
  - `GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [x] Supabase 마이그레이션 실행 (`supabase/migrations/20260429000000_init.sql`)
  - `users` 테이블 단일 테이블 구조 확인

**완료 기준:** Supabase 대시보드에서 `users` 테이블 확인, GitHub API 200 응답

---

## Phase 1: 공유 유틸리티 레이어

> 이후 API·배치·프론트가 모두 재사용하는 핵심 함수. 이 Phase가 완료돼야 나머지 작업 가능.

- [x] `lib/supabase.ts` — Supabase 서버 클라이언트 (service role key 사용)
- [x] `lib/github.ts` — GitHub GraphQL 잔디 데이터 조회 함수
  - 입력: `username: string`
  - 출력: `{ total_contributions, current_streak, longest_streak, contribution_density, peak_intensity }`
- [x] `lib/score.ts` — 전투력 점수 계산 함수
  - 공식: `total×1 + current_streak×3 + longest_streak×2 + density(%)×100 + peak×0.5`
- [x] `lib/tier.ts` — 백분위 기준 tier·tier_rank 산출 함수
  - 챌린저: score 내림차순 상위 100명 절대 고정
  - 다이아(1~5%), 플래티넘(5~15%), 골드(15~30%), 실버(30~50%), 브론즈(50~100%)
  - tier_rank: 구간 4등분, 낮은 숫자가 높은 등급
- [x] `lib/badge.ts` — 티어별 SVG 생성 함수
  - 입력: `{ github_id, tier, tier_rank, score }`
  - 출력: SVG 문자열
  - 형식: `DevTier | 골드 2 | 1234점`
  - 챌린저 `#FF4655` / 다이아 `#56C8D8` / 플래티넘 `#5AC9A6` / 골드 `#FFD700` / 실버 `#C0C0C0` / 브론즈 `#CD7F32`

**완료 기준:** 각 함수 단독 호출로 예상 출력 확인 가능

---

## Phase 2: API 개발

> Phase 1 완료 후 진행.

- [x] `app/api/score/[username]/route.ts`
  - `lib/github.ts` → `lib/score.ts` → `lib/tier.ts` 순으로 호출
  - 결과를 `users` 테이블에 upsert (백분위는 배치 스크립트에서 계산하므로 일단 NULL)
  - JSON 응답 반환 (명세서 Response 형식 참고)
- [x] `app/api/badge/[username]/route.ts`
  - `users` 테이블에서 tier·tier_rank·score 조회
  - `lib/badge.ts`로 SVG 생성 후 반환
  - Content-Type: `image/svg+xml`
  - Cache-Control: `public, max-age=3600`
- [x] `app/api/ranking/route.ts`
  - `users` 테이블 score 내림차순 최대 100명 조회
  - rank 필드 포함하여 JSON 반환

**완료 기준:**
- `GET /api/score/{username}` → tier·score·percentile 포함 JSON
- `GET /api/badge/{username}` → 브라우저에서 SVG 렌더링 확인
- `GET /api/ranking` → 배열 JSON 반환

---

## Phase 3: 배치 스크립트

> Phase 2 완료 후 진행. `users` 테이블이 충분히 채워져야 백분위 계산이 의미 있음.

- [ ] `scripts/collect-users.ts` — GitHub Search API로 한국 유저 목록 수집
  - 쿼리 4종 순차 실행 (각 최대 1,000명)
  - 중복 제거 후 `users` 테이블에 github_id upsert (점수 필드는 초기값)
- [ ] `scripts/collect-scores.ts` — 전체 유저 점수 계산·저장
  - `users` 테이블 전체 순회
  - `lib/github.ts`·`lib/score.ts` 재사용
  - GitHub API Rate Limit 고려한 딜레이 처리 (5,000 req/hr)
  - `users` 테이블 score·지표 upsert
- [ ] `scripts/recalc-tiers.ts` — 전체 백분위·티어 재산출
  - 전체 유저 score 기준 백분위 계산
  - `lib/tier.ts` 재사용하여 tier·tier_rank 결정
  - `users` 테이블 전체 업데이트

**완료 기준:** 스크립트 실행 후 `users` 테이블에 1,000+ 행, tier 필드 채워진 상태 확인

---

## Phase 4: 프론트엔드

> Phase 2 완료 후 진행 (API가 있어야 프론트 테스트 가능).

- [ ] `app/page.tsx` — 메인 페이지
  - GitHub 아이디 입력창 (검색 폼)
  - 제출 시 `/result/[username]`으로 이동
  - 하단에 전체 랭킹 테이블 (`/api/ranking` 호출, 최대 100명)
  - 컬럼: 순위 / GitHub 아이디 / 티어 / 전투력 점수
- [ ] `app/result/[username]/page.tsx` — 결과 페이지
  - 티어 카드 (티어명 + 티어 숫자 + 티어 색상)
  - 전투력 점수 및 세부 지표 5종
  - 백분위 표시 ("수집된 한국 개발자 상위 N%")
  - 뱃지 코드 복사 버튼: `![DevTier](https://devtier.dev/api/badge/{username})`
  - 주의 문구: "GitHub location을 한국으로 설정한 유저 기준 백분위입니다"

**완료 기준:** 메인 → 아이디 입력 → 결과 페이지 → 뱃지 복사 골든 패스 브라우저 확인

---

## 파일 맵

```
lib/
  supabase.ts           # Phase 1
  github.ts             # Phase 1
  score.ts              # Phase 1
  tier.ts               # Phase 1
  badge.ts              # Phase 1
app/
  page.tsx              # Phase 4 (메인)
  result/
    [username]/
      page.tsx          # Phase 4 (결과)
  api/
    score/
      [username]/
        route.ts        # Phase 2
    badge/
      [username]/
        route.ts        # Phase 2
    ranking/
      route.ts          # Phase 2
scripts/
  collect-users.ts      # Phase 3
  collect-scores.ts     # Phase 3
  recalc-tiers.ts       # Phase 3
supabase/
  migrations/
    20260429000000_init.sql  # users 테이블 단일 스키마
```
