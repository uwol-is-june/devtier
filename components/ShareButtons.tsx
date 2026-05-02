'use client'

import { useEffect, useState } from 'react'

interface ShareButtonsProps {
  username: string
  score: number
  tierLabel: string
  percentile: number | null
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (options: object) => void
      }
    }
  }
}

export function ShareButtons({ username, score, tierLabel, percentile, isOwn = false }: ShareButtonsProps & { isOwn?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [kakaoReady, setKakaoReady] = useState(false)

  const pageUrl = `https://devtier.dev/result/${username}`
  const subject = isOwn ? '나의' : `${username}의`
  const shareText = `${subject} GitHub 개발자 전투력은 ${tierLabel}! 💪 전투력 ${score.toLocaleString('ko-KR')}점${percentile ? ` (한국 개발자 상위 ${percentile.toFixed(1)}%)` : ''} — DevTier에서 내 랭킹 확인해봐`
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

  useEffect(() => {
    if (!kakaoKey) return

    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey)
      }
      setKakaoReady(true)
    }
    document.head.appendChild(script)
  }, [kakaoKey])

  function handleCopyLink() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleTwitterShare() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  function handleKakaoShare() {
    if (!window.Kakao?.Share) return
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${username}의 DevTier — ${tierLabel}`,
        description: shareText,
        imageUrl: `https://devtier.dev/api/badge/${username}`,
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
      },
      buttons: [{ title: '내 티어 확인하기', link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }],
    })
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-3">
      <p className="text-sm text-[var(--text-sub)]">결과 공유하기</p>
      <div className="flex gap-2 flex-wrap">
        {/* 링크 복사 */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 cursor-pointer active:scale-95"
          style={copied
            ? { background: '#1a4a2e', borderColor: '#2ea043', color: '#3fb950' }
            : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-sub)' }
          }
        >
          <LinkIcon />
          {copied ? '✓ 링크 복사됨' : '링크 복사'}
        </button>

        {/* X(트위터) 공유 */}
        <button
          onClick={handleTwitterShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 cursor-pointer active:scale-95"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-sub)' }}
        >
          <XIcon />
          X 공유
        </button>

        {/* 카카오톡 공유 — 앱키 없으면 숨김 */}
        {kakaoKey && kakaoReady && (
          <button
            onClick={handleKakaoShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 cursor-pointer active:scale-95"
            style={{ background: '#FEE500', borderColor: '#FEE500', color: '#191919' }}
          >
            <KakaoIcon />
            카카오톡 공유
          </button>
        )}
      </div>
    </div>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.859L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.98 1.81 5.6 4.54 7.17L5.5 22l4.27-2.24C10.48 19.91 11.23 20 12 20c5.523 0 10-3.82 10-8.5S17.523 3 12 3z" />
    </svg>
  )
}
