import type { ContributionStats } from './github'

export function detectSuspiciousActivity(stats: ContributionStats): number {
  const { total_contributions, total_prs, total_stars, contribution_cv } = stats

  // Signal 1+2: PR 절대값 + CV 결합
  // PR/잔디 비율 방식 대신 절대값 사용 — 잔디가 많을수록 불이익을 받는 역효과 방지
  let collab_cv: number
  if (total_prs >= 5) {
    collab_cv = 1.0
  } else if (total_prs >= 1) {
    collab_cv = 0.85
  } else {
    // PR = 0: CV로 솔로 개발자 vs 봇 구분
    if (total_contributions < 30) {
      collab_cv = 0.75
    } else if (contribution_cv >= 1.0) {
      collab_cv = 0.85  // 자연스러운 분포 → 솔로 개발자
    } else if (contribution_cv >= 0.5) {
      collab_cv = 0.70  // 다소 균일 → 약한 의심
    } else {
      collab_cv = 0.40  // 매우 균일 → 봇 강의심
    }
  }

  // Signal 3: 스타 신뢰도
  let stars_factor = 1.0
  if (total_contributions > 200 && total_stars === 0 && total_prs === 0) stars_factor = 0.5
  else if (total_contributions > 200 && total_stars === 0) stars_factor = 0.75

  return Math.max(0.1, Math.min(1.0, collab_cv * stars_factor))
}

export function calcScore(stats: ContributionStats): number {
  const { total_contributions, current_streak, longest_streak, contribution_density, peak_intensity, total_stars, current_year_commits, total_prs, total_issues } = stats
  const raw = Math.round(
    total_contributions * 1 +
    current_streak * 3 +
    longest_streak * 2 +
    contribution_density * 100 * 100 +
    peak_intensity * 0.5 +
    Math.log2(total_stars + 1) * 10 +
    current_year_commits * 0.5 +
    total_prs * 3 +
    total_issues * 1
  )
  return Math.round(raw * detectSuspiciousActivity(stats))
}
