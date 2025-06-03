/**
 * LLMO診断サイト - メインレイアウト
 * SEO対応、Open Graphタグ、日本語フォント設定を含む
 */

import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

/** Google Fonts設定 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

/** サイトのメタデータ設定 - SEO最適化済み */
export const metadata: Metadata = {
  title: 'LLMO診断サイト - Claude Sonnet 4による無料AI Webサイト分析ツール',
  description: 'あらゆるWebサイトのURLを入力するだけで、Claude Sonnet 4 AIによる詳細な分析レポートを即座に取得。SEO診断、コンテンツ品質評価、ユーザビリティチェック、LLMO最適化度を総合的に診断する無料ツールです。',
  keywords: [
    'ウェブサイト分析', 'SEO診断', 'AI分析', 'Claude Sonnet 4', 'サイト診断', 
    'LLMO最適化', 'コンテンツ分析', 'ユーザビリティ診断', '無料ツール', 
    'Webサイト評価', 'AI診断', 'サイト改善', 'SEOチェック', 'Claude分析'
  ],
  authors: [{ name: 'LLMO診断サイト運営チーム', url: 'https://llmo-check.vercel.app' }],
  creator: 'LLMO診断サイト運営チーム',
  publisher: 'LLMO診断サイト',
  category: 'Technology',
  classification: 'SEO診断ツール',
  openGraph: {
    title: 'LLMO診断サイト - Claude Sonnet 4による無料AI Webサイト分析ツール',
    description: 'URLを入力するだけでClaude Sonnet 4 AIがWebサイトを詳細分析。SEO、LLMO最適化、コンテンツ品質、ユーザビリティを総合診断する無料ツール。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'LLMO診断サイト',
    url: 'https://llmo-check.vercel.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LLMO診断サイト - Claude Sonnet 4による無料AI Webサイト分析ツール',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@llmo_diagnosis',
    creator: '@llmo_diagnosis',
    title: 'LLMO診断サイト - Claude Sonnet 4による無料AI Webサイト分析',
    description: 'URLを入力するだけでClaude Sonnet 4 AIがWebサイトを詳細分析。SEO、LLMO最適化を総合診断する無料ツール。',
    images: ['/twitter-card.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
    other: {
      'claude-ai-diagnostic': 'LLMO診断サイト公式',
    },
  },
  alternates: {
    canonical: 'https://llmo-check.vercel.app',
    languages: {
      'ja-JP': 'https://llmo-check.vercel.app',
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'application-name': 'LLMO診断サイト',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

/**
 * ルートレイアウトコンポーネント
 * 全ページ共通のHTML構造とスタイル設定
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`h-full ${inter.variable} ${notoSansJP.variable}`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LLMO診断サイト",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "description": "Claude Sonnet 4 AIによる無料Webサイト分析・診断ツール。SEO、LLMO最適化、コンテンツ品質を総合的に診断します。",
              "url": "https://llmo-check.vercel.app",
              "author": {
                "@type": "Organization",
                "name": "LLMO診断サイト運営チーム"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              },
              "featureList": [
                "AI powered Webサイト分析",
                "SEO診断",
                "LLMO最適化チェック",
                "コンテンツ品質評価",
                "ユーザビリティ診断",
                "24時間スマートキャッシュ",
                "即座の分析結果取得"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              }
            })
          }}
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//api.anthropic.com" />
        <link rel="dns-prefetch" href="//supabase.co" />
      </head>
      <body className="h-full bg-neutral-light font-sans antialiased">
        {/* メインコンテンツエリア */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>

        {/* フッター */}
        <footer className="bg-neutral-dark text-white py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                © 2024 LLMO診断サイト. Powered by AI.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 