# DevTier 개발 태스크

> 세션 간 작업 이어받기용 파일. 각 태스크 완료 시 `[ ]` → `[x]`로 변경.
> 현재 작업 중인 태스크는 `[~]`로 표시.
> 완료된 버전 내역은 README.md Changelog 참고.

---

## v0.5.0 — 프리미엄 + 뱃지 고도화

> v0.4.0 배포 후, 초기 유저 확보 이후 진행.

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
  TierIcon.tsx          # v0.4.0
  SearchForm.tsx        # v0.4.0
  BadgeCopy.tsx         # v0.4.0
  ScoreCounter.tsx      # v0.4.0
app/
  page.tsx              # v0.4.0 (메인)
  result/
    [username]/
      page.tsx          # v0.4.0 (결과)
  api/
    score/[username]/route.ts   # v0.3.0
    badge/[username]/route.ts   # v0.3.0
    ranking/route.ts            # v0.3.0
scripts/
  collect-users.ts      # v0.3.0
  collect-scores.ts     # v0.3.0
  recalc-tiers.ts       # v0.3.0
supabase/
  migrations/
    20260429000000_init.sql     # v0.3.0
```
