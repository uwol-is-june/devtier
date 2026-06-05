export type Locale = 'ko' | 'en'

export type Translations = {
  tier: {
    labels: Record<string, string>
    ranges: Record<string, string>
  }
  nav: {
    ranking: string
    features: string
  }
  hero: {
    statusBadge: string
    tagline: string
    taglineHighlight: string
    taglineSuffix: string
    subtitle: string
    featuresBtn: string
    viewDetails: string
    combatPower: string
    topPercent: (n: string) => string
  }
  features: {
    sectionLabel: string
    title: string
    items: Array<{ title: string; desc: string; statLabel: string }>
  }
  system: {
    label: string
    title: string
    desc: (n: string) => string
    panelLabel: string
    scoreMetricsVal: string
    tierDistLabel: string
    tierLadderLabel: string
    formulaLabel: string
    formulaMetrics: {
      grass: string
      currentStreak: string
      maxStreak: string
      star: string
      yearCommit: string
      pr: string
      issue: string
    }
  }
  ranking: {
    label: string
    title: string
    totalUsers: (n: string) => string
  }
  cta: {
    label: string
    headingPrefix: string
    headingHighlight: string
    headingSuffix: string
    desc: string
    viewResult: string
    viewRanking: string
    finePrint: string
  }
  login: {
    button: string
    connecting: string
  }
  logout: {
    button: string
  }
  result: {
    notFoundMsg: (user: string) => string
    notFoundSuffix: string
    backToHome: string
    rankInfo: string
    combatPower: string
    points: string
    nextTier: (label: string, gap: string) => string
    topPercent: (n: string) => string
    langTopPercent: (lang: string, n: string) => string
    totalUsers: (n: string) => string
    tabs: { stats: string; achievements: string }
    badgeTerminalTitle: string
  }
  stats: {
    [key: string]: {
      label: (year?: number) => string
      tooltip: (year?: number) => string
    }
  }
  badge: {
    title: string
    themeLabel: string
    sizeLabel: string
    alignLabel: string
    langLabel: string
    themes: Record<string, string>
    sizes: Record<string, string>
    aligns: Record<string, string>
    copy: string
    copied: string
  }
  share: {
    title: string
    copyLink: string
    linkCopied: string
    xShare: string
    kakaoShare: string
    shareText: (subject: string, tier: string, score: string, percentile: string | null) => string
    ownSubject: string
    otherSubject: (name: string) => string
  }
  rankingTable: {
    tierHeader: string
    combatHeader: string
    percentileHeader: string
    me: string
    ghProfile: string
    topPercent: (n: string) => string
    empty: string
    loading: string
    expand: string
    collapse: string
  }
  achievements: {
    title: string
    categories: Record<string, string>
    empty: string
    heldBy: (n: string) => string
    achieved: (date: string) => string
    tooltipLabel: string
  }
  download: {
    save: string
    saving: string
  }
  search: {
    placeholder: string
    button: string
    loading: string
  }
  loading: {
    lines: string[]
  }
  weakness: {
    bottom: (label: string, n: number) => string
    desc: string
  }
  advice: {
    sectionLabel: string
    topRank: string
    streakStart: string
    streakExtend: (days: number) => string
    prPenalty: (needed: number, multiplier: string) => string
    prCount: (needed: number) => string
    density: (current: number) => string
    gainBadge: (n: string) => string
  }
  compare: {
    vs: string
    draw: string
    winsBy: (winner: string, gap: string) => string
    statsLabel: string
    withLabel: string
    inputPlaceholder: string
    goBtn: string
    copyLink: string
    linkCopied: string
    radarTitle: string
  }
}
