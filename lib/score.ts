import type { ContributionStats } from './github'

export function calcScore(stats: ContributionStats): number {
  const { total_contributions, current_streak, longest_streak, contribution_density, peak_intensity, total_stars, current_year_commits, total_prs, total_issues } = stats
  return Math.round(
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
}
