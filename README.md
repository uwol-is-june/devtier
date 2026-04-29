# DevTier

GitHub 잔디(contribution) 데이터로 한국 개발자 전투력을 측정하고 티어를 부여하는 서비스.

**도메인:** devtier.dev

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

| 티어 | 기준 |
| --- | --- |
| 챌린저 | 한국 상위 100명 (절대 인원 고정) |
| 다이아 1~4 | 상위 1% ~ 5% |
| 플래티넘 1~4 | 상위 5% ~ 15% |
| 골드 1~4 | 상위 15% ~ 30% |
| 실버 1~4 | 상위 30% ~ 50% |
| 브론즈 1~4 | 상위 50% ~ 100% |

티어 내 숫자가 낮을수록 높은 등급 (브론즈 1 > 브론즈 2 > 브론즈 3 > 브론즈 4).

---

## 기술 스택

| 구성 | 기술 |
| --- | --- |
| 프론트 + 백엔드 | Next.js (Vercel 배포) |
| DB | Supabase |
| GitHub 데이터 | GitHub GraphQL API |
| 뱃지 | SVG 동적 생성 |
| 인증 | GitHub Personal Access Token |

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
