# DevTier 개발 가이드

내부 개발·운영용 문서.

---

## 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인.

---

## 환경변수

`.env.local` 파일을 루트에 생성하고 아래 값을 채워넣는다.

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

---

## 주요 API 엔드포인트

| 엔드포인트 | 설명 |
| --- | --- |
| `GET /api/score/[username]` | 유저 전투력 점수 및 티어 반환 |
| `GET /api/badge/[username]` | SVG 뱃지 반환 (캐시 1시간) |
| `GET /api/ranking` | 전체 랭킹 상위 100명 반환 |

---

## 배치 스크립트

한국 개발자 데이터 수집 및 티어 산출. 주 1회 실행 권장.

```bash
# 순서대로 실행
npm run collect:users   # GitHub Search API로 한국 유저 수집 (약 3~4분)
npm run collect:scores  # 전체 유저 점수 계산 (3,000명 기준 약 37분)
npm run recalc:tiers    # 백분위·티어 전체 재산출 (수초)

# 또는 한번에
npm run batch:all
```

---

## Changelog

### v0.4.0 (2026-05-01)
- 다크 디자인 시스템 전면 적용 (`#0d1117` / `#161b22` / `#30363d`)
- 티어별 3D SVG 아이콘: 챌린저(왕관 shimmer), 다이아(젬 rotate-shimmer), 플래티넘~브론즈(메달 glow-pulse)
- 전체 CSS 애니메이션: fade-in-up stagger, gradient text, score count-up, border-pulse
- 메인 페이지: 히어로 그라디언트 텍스트 + GitHub 아이디 검색폼 + 전체 랭킹 테이블
- 결과 페이지: 티어 카드(3D 아이콘·테두리 glow) + 세부 지표 5종 + 뱃지 복사
- `components/TierIcon.tsx` — 티어별 3D SVG 아이콘 컴포넌트
- `components/SearchForm.tsx` — 검색 폼 (focus glow)
- `components/BadgeCopy.tsx` — 클립보드 복사 버튼 (상태 전환 애니메이션)
- `components/ScoreCounter.tsx` — 점수 카운트업 (ease-out cubic)

### v0.3.0 (2026-04-29)
- 유틸 레이어: `lib/supabase.ts`, `lib/github.ts`, `lib/score.ts`, `lib/tier.ts`, `lib/badge.ts`
- API: `GET /api/score/[username]` — 잔디 조회 → 점수 계산 → DB upsert → tier/rank 반환
- API: `GET /api/badge/[username]` — tier별 색상 SVG 뱃지, `Cache-Control: public, max-age=3600`
- API: `GET /api/ranking` — score 내림차순 상위 100명
- 배치: `collect-users`, `collect-scores`, `recalc-tiers` 스크립트
- Supabase `users` 테이블 마이그레이션
