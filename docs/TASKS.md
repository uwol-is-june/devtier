# DevTier 개발 태스크

## 1. 환경 세팅
- [ ] GitHub Personal Access Token 발급
- [ ] Vercel 프로젝트 생성 및 환경변수 등록
- [ ] Supabase 프로젝트 생성
- [ ] Supabase `users` 테이블 생성
- [ ] Supabase `scores` 테이블 생성
- [ ] `.env.local` 작성 및 동작 확인

## 2. 한국 유저 수집 배치
- [ ] GitHub Search API로 한국 유저 목록 수집 (location 키워드 4종)
- [ ] 중복 제거 후 `users` 테이블에 저장
- [ ] GitHub GraphQL API로 각 유저 잔디 데이터 수집
- [ ] 전투력 점수 계산 후 `scores` 테이블에 저장

## 3. 점수 계산 API
- [ ] GitHub GraphQL로 잔디 데이터 조회 함수 구현
- [ ] 전투력 점수 계산 로직 구현 (5개 지표)
- [ ] DB 기준 백분위 계산 → 티어 산출 로직 구현
- [ ] `GET /api/score/[username]` 엔드포인트 완성

## 4. 뱃지 API
- [ ] 티어별 SVG 디자인 및 색상 정의
- [ ] SVG 동적 생성 함수 구현
- [ ] `GET /api/badge/[username]` 엔드포인트 완성
- [ ] `Cache-Control: max-age=3600` 헤더 설정

## 5. 프론트 개발
- [ ] 메인 페이지 (GitHub 아이디 입력창)
- [ ] 결과 페이지 (티어 카드 + 점수 + 잔디 시각화)
- [ ] 뱃지 코드 복사 기능
- [ ] 전체 랭킹 페이지
