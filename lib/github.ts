export type ContributionStats = {
  total_contributions: number
  current_streak: number
  longest_streak: number
  contribution_density: number
  peak_intensity: number
}

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

const QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
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
    }
  }
`

export async function fetchContributions(username: string): Promise<ContributionStats> {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
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

  const calendar = json.data.user.contributionsCollection.contributionCalendar
  const days: { date: string; count: number }[] = calendar.weeks
    .flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
    )
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))

  const total_contributions: number = calendar.totalContributions
  const peak_intensity = days.reduce((max, d) => Math.max(max, d.count), 0)
  const activeDays = days.filter((d) => d.count > 0).length
  const contribution_density = days.length > 0 ? activeDays / days.length : 0

  // 역순으로 오늘부터 연속 스트릭 계산
  let current_streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      current_streak++
    } else {
      // 오늘 날짜가 아직 끝나지 않은 경우를 위해 마지막 날은 0이어도 스킵
      if (i === days.length - 1) continue
      break
    }
  }

  // 전체 기간 최장 스트릭 계산
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

  return { total_contributions, current_streak, longest_streak, contribution_density, peak_intensity }
}
