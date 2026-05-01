# DevTier

GitHub 잔디(contribution) 데이터로 한국 개발자 전투력을 측정하고 티어를 부여하는 서비스.
백준 온라인 저지 종료 이후 개발자가 실력을 증명할 새로운 지표.

**🌐 [https://devtier-brown.vercel.app](https://devtier-brown.vercel.app)**

> 커스텀 도메인 연결 후 `devtier.dev` 로 변경 예정

---

## 핵심 기능

### 전투력 측정
GitHub 아이디 입력 → 잔디 데이터 수집 → 전투력 점수 계산 → 티어 부여

| 지표 | 설명 |
| --- | --- |
| 총 잔디 수 | 최근 1년 contribution 합산 |
| 연속 스트릭 | 현재 몇 일 연속 커밋 중 |
| 최대 스트릭 | 역대 최장 연속 기록 |
| 잔디 밀도 | 365일 중 커밋한 날 비율 |
| 피크 강도 | 하루 최대 커밋 수 |

### README 뱃지 자동 생성
결과 페이지에서 뱃지 코드를 복사해 GitHub 프로필 README에 붙여넣으면 적용됨. 점수 변동 시 자동 업데이트.

```markdown
![DevTier](https://devtier.dev/api/badge/깃헙아이디)
```

---

## 티어 구조

| 티어 | 기준 | 색상 |
| --- | --- | --- |
| 챌린저 | 한국 상위 100명 (절대 인원 고정) | `#FF4655` |
| 다이아 1~4 | 상위 1% ~ 5% | `#56C8D8` |
| 플래티넘 1~4 | 상위 5% ~ 15% | `#5AC9A6` |
| 골드 1~4 | 상위 15% ~ 30% | `#FFD700` |
| 실버 1~4 | 상위 30% ~ 50% | `#C0C0C0` |
| 브론즈 1~4 | 상위 50% ~ 100% | `#CD7F32` |

티어 내 숫자가 낮을수록 높은 등급 (1이 최고).

---

## 기술 스택

| 구성 | 기술 |
| --- | --- |
| 프론트 + 백엔드 | Next.js (Vercel 배포) |
| DB | Supabase (PostgreSQL) |
| GitHub 데이터 | GitHub GraphQL API |
| 뱃지 | SVG 동적 생성 |
| 인증 (v0.5.0~) | GitHub OAuth (Supabase Auth) |

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

## 로드맵

| 버전 | 내용 | 상태 |
| --- | --- | --- |
| v0.3.0 | 코어 레이어 (유틸 + API + 배치 스크립트) | ✅ 완료 |
| v0.4.0 | 프론트엔드 MVP + 다크 디자인 시스템 + 3D 아이콘·애니메이션 | ✅ 완료 |
| v0.5.0 | 프리미엄 (SVG 뱃지 애니메이션, 티어 카드 이미지 다운로드, 결제) | 📋 예정 |

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
