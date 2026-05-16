export type ContributionStats = {
  total_contributions: number
  current_streak: number
  longest_streak: number
  contribution_density: number
  peak_intensity: number
  total_stars: number
  current_year_commits: number
  total_prs: number
  total_issues: number
  top_languages: { name: string; pct: number }[]
}

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

function buildQuery(currentYearStart: string): string {
  return `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      currentYear: contributionsCollection(from: "${currentYearStart}") {
        totalCommitContributions
      }
      repositories(first: 100, ownerAffiliations: [OWNER]) {
        nodes {
          stargazerCount
          languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node { name }
            }
          }
        }
      }
    }
  }
`
}

export async function fetchContributions(username: string): Promise<ContributionStats> {
  const currentYear = new Date().getFullYear()
  const currentYearStart = `${currentYear}-01-01T00:00:00Z`

  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query: buildQuery(currentYearStart), variables: { username } }),
  })

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`)
  }

  if (!json.data.user) {
    throw new Error(`GitHub user not found: ${username}`)
  }

  const { contributionsCollection, currentYear: currentYearData, repositories } = json.data.user

  const calendar = contributionsCollection.contributionCalendar
  const days: { date: string; count: number }[] = calendar.weeks
    .flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
    )
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))

  const total_contributions: number = calendar.totalContributions
  const peak_intensity = days.reduce((max, d) => Math.max(max, d.count), 0)
  const activeDays = days.filter((d) => d.count > 0).length
  const contribution_density = days.length > 0 ? activeDays / days.length : 0

  let current_streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      current_streak++
    } else {
      if (i === days.length - 1) continue
      break
    }
  }

  let longest_streak = 0
  let streak = 0
  for (const d of days) {
    if (d.count > 0) {
      streak++
      longest_streak = Math.max(longest_streak, streak)
    } else {
      streak = 0
    }
  }

  const repos: { stargazerCount: number; languages: { edges: { size: number; node: { name: string } }[] } }[] =
    repositories?.nodes ?? []
  const total_stars = repos.reduce((sum, r) => sum + (r.stargazerCount ?? 0), 0)

  // 언어 비율 계산: 전체 바이트 합산 → 언어별 비율 → 상위 5개
  const langBytes = new Map<string, number>()
  for (const repo of repos) {
    for (const edge of repo.languages?.edges ?? []) {
      const name = edge.node.name
      langBytes.set(name, (langBytes.get(name) ?? 0) + edge.size)
    }
  }
  const totalBytes = Array.from(langBytes.values()).reduce((s, v) => s + v, 0)
  const top_languages: { name: string; pct: number }[] = totalBytes > 0
    ? Array.from(langBytes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 1000) / 10 }))
    : []

  const total_prs: number = contributionsCollection.totalPullRequestContributions ?? 0
  const total_issues: number = contributionsCollection.totalIssueContributions ?? 0
  const current_year_commits: number = currentYearData?.totalCommitContributions ?? 0

  return {
    total_contributions,
    current_streak,
    longest_streak,
    contribution_density,
    peak_intensity,
    total_stars,
    current_year_commits,
    total_prs,
    total_issues,
    top_languages,
  }
}
