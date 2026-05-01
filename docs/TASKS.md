# DevTier 개발 태스크

> 세션 간 작업 이어받기용 파일. 각 태스크 완료 시 `[ ]` → `[x]`로 변경.
> 현재 작업 중인 태스크는 `[~]`로 표시.

---

## v0.3.0 — 코어 레이어 ✅

### Phase 0: 환경 세팅

- [x] `.env.local` 환경변수 3종 세팅 확인
  - `GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [x] Supabase 마이그레이션 실행 (`supabase/migrations/20260429000000_init.sql`)
  - `users` 테이블 단일 테이블 구조 확인

### Phase 1: 공유 유틸리티 레이어

- [x] `lib/supabase.ts` — Supabase 서버 클라이언트 (service role key 사용)
- [x] `lib/github.ts` — GitHub GraphQL 잔디 데이터 조회 함수
- [x] `lib/score.ts` — 전투력 점수 계산 함수
- [x] `lib/tier.ts` — 백분위 기준 tier·tier_rank 산출 함수
- [x] `lib/badge.ts` — 티어별 SVG 생성 함수

### Phase 2: API 개발

- [x] `app/api/score/[username]/route.ts`
- [x] `app/api/badge/[username]/route.ts`
- [x] `app/api/ranking/route.ts`

### Phase 3: 배치 스크립트

- [x] `scripts/collect-users.ts` — GitHub Search API로 한국 유저 목록 수집
- [x] `scripts/collect-scores.ts` — 전체 유저 점수 계산·저장
- [x] `scripts/recalc-tiers.ts` — 전체 백분위·티어 재산출

---

## v0.4.0 — 프론트엔드 MVP + 디자인 시스템 + 3D 아이콘·애니메이션

> v0.5.0에 예정된 디자인 고도화를 v0.4.0으로 앞당겨 반영.

### 디자인 시스템

- [~] `app/globals.css` — 디자인 토큰 (bg/surface/border/text 변수) + keyframe 애니메이션 정의
- [~] `app/layout.tsx` — 메타데이터 수정, 다크모드 강제, 폰트 정리

### 3D 아이콘 + 애니메이션

- [~] `components/TierIcon.tsx` — 티어별 3D SVG 아이콘
  - 챌린저: 왕관 + shimmer sweep 애니메이션
  - 다이아: 젬 + rotate-shimmer 애니메이션
  - 플래티넘~브론즈: 메달/크리스탈 + glow-pulse 애니메이션

### 클라이언트 컴포넌트

- [~] `components/SearchForm.tsx` — GitHub 아이디 입력 폼 (focus glow, hover 효과)
- [~] `components/BadgeCopy.tsx` — 뱃지 복사 버튼 ("복사" → "✓ 복사됨" 상태 전환 애니메이션)
- [~] `components/ScoreCounter.tsx` — 점수 카운트업 애니메이션 (0 → 실제값)

### 페이지

- [~] `app/page.tsx` — 메인 페이지
  - 다크 히어로 + 그라디언트 텍스트 애니메이션
  - GitHub 아이디 입력창 → `/result/[username]` 이동
  - 전체 랭킹 테이블 (hover lift 효과, 행 진입 stagger animation)
  - 컬럼: 순위 / GitHub 아이디 / 티어 아이콘 / 전투력 점수
- [~] `app/result/[username]/page.tsx` — 결과 페이지
  - 티어 카드 (3D 아이콘 + 티어명 + 색상 테두리, fade-in-up 진입)
  - 전투력 점수 카운트업 애니메이션
  - 세부 지표 5종 (stagger fade-in)
  - 백분위 표시 ("수집된 한국 개발자 상위 N%")
  - 뱃지 복사 버튼
  - 주의 문구: "GitHub location을 한국으로 설정한 유저 기준 백분위입니다"

**완료 기준:** 메인 → 아이디 입력 → 결과 페이지 (3D 아이콘·애니메이션 동작) → 뱃지 복사 골든 패스 브라우저 확인

---

## v0.5.0 — 프리미엄 + 뱃지 애니메이션 고도화

> v0.4.0 MVP 배포 후, 초기 유저 확보 이후 진행.

- [ ] 무료 뱃지 SVG 애니메이션 추가 (idle glow / stroke animation, GitHub README 렌더 호환)
- [ ] 티어 카드 이미지 다운로드 기능 (PNG export, 트위터 인증샷용)

**완료 기준:** 뱃지 SVG 애니메이션 동작 + 티어 카드 이미지 다운로드 확인

> 프리미엄 뱃지, 인증/결제, 프리미엄 전용 기능 → [BACKLOG.md](BACKLOG.md) 참고

---

## 파일 맵

```
lib/
  supabase.ts           # v0.3.0
  github.ts             # v0.3.0
  score.ts              # v0.3.0
  tier.ts               # v0.3.0
  badge.ts              # v0.3.0 / v0.5.0 (SVG 뱃지 애니메이션 추가)
components/
  TierIcon.tsx          # v0.4.0 (3D SVG 아이콘 + CSS 애니메이션)
  SearchForm.tsx        # v0.4.0 (검색 폼, client)
  BadgeCopy.tsx         # v0.4.0 (뱃지 복사, client)
  ScoreCounter.tsx      # v0.4.0 (점수 카운트업, client)
app/
  page.tsx              # v0.4.0 (메인)
  result/
    [username]/
      page.tsx          # v0.4.0 (결과)
  api/
    score/
      [username]/
        route.ts        # v0.3.0
    badge/
      [username]/
        route.ts        # v0.3.0
    ranking/
      route.ts          # v0.3.0
scripts/
  collect-users.ts      # v0.3.0
  collect-scores.ts     # v0.3.0
  recalc-tiers.ts       # v0.3.0
supabase/
  migrations/
    20260429000000_init.sql       # v0.3.0
```
