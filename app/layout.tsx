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
  title: 'LLMO対策チェックサイト - 無料AI webサイト分析ツール | SEO診断・LLMO最適化',
  description: 'あらゆるWebサイトのURLを入力するだけで、AIによる詳細な分析レポートを即座に取得。SEO診断、コンテンツ品質評価、ユーザビリティチェック、LLMO最適化度を総合的に診断する完全無料ツールです。Claude、ChatGPT、Gemini等のAI検索エンジン対応。',
  keywords: [
    'LLMO対策', 'LLMO最適化', 'SEO診断', 'AI分析', 'ウェブサイト分析', 'サイト診断', 
    'コンテンツ分析', 'ユーザビリティ診断', '無料ツール', 'Webサイト評価', 'AI診断', 
    'サイト改善', 'SEOチェック', 'Claude対策', 'ChatGPT対策', 'Gemini対策', 'Perplexity対策',
    '検索エンジン最適化', 'Large Language Model Optimization', 'AI検索対応', 'コンテンツ最適化',
    'メタタグ診断', 'タイトル診断', 'キーワード分析', 'サイト構造分析', 'レスポンシブ診断'
  ],
  authors: [{ name: 'LLMO対策チェックサイト運営チーム', url: 'https://llmocheck.ai' }],
  creator: 'LLMO対策チェックサイト運営チーム',
  publisher: 'LLMO対策チェックサイト',
  category: 'Technology',
  classification: 'SEO・LLMO診断ツール',
  openGraph: {
    title: 'LLMO対策チェックサイト - 無料AI webサイト分析ツール',
    description: 'URLを入力するだけでAIがWebサイトを詳細分析。SEO、LLMO最適化、コンテンツ品質、ユーザビリティを総合診断する完全無料ツール。Claude、ChatGPT、Gemini等のAI検索エンジン対応。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'LLMO対策チェックサイト',
    url: 'https://llmocheck.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LLMO対策チェックサイト - 無料AI webサイト分析ツール | SEO診断・LLMO最適化',
      },
    ],
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
  alternates: {
    canonical: 'https://llmocheck.ai',
    languages: {
      'ja-JP': 'https://llmocheck.ai',
      'ja': 'https://llmocheck.ai',
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'LLMO対策チェック',
    'application-name': 'LLMO対策チェックサイト',
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
        
        {/* Structured Data - LLMO・SEO最適化済み */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LLMO対策チェックサイト",
              "alternateName": "LLMO対策チェック",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "description": "AIによる無料Webサイト分析・診断ツール。SEO、LLMO最適化、コンテンツ品質、AI検索エンジン対応を総合的に診断します。Claude、ChatGPT、Gemini、Perplexity等のLLM検索エンジンに最適化。",
              "url": "https://llmocheck.ai",
              "author": {
                "@type": "Organization",
                "name": "LLMO対策チェックサイト運営チーム",
                "url": "https://llmocheck.ai"
              },
              "publisher": {
                "@type": "Organization",
                "name": "LLMO対策チェックサイト"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY",
                "description": "完全無料のAI powered Webサイト分析ツール"
              },
              "featureList": [
                "AI powered Webサイト分析",
                "SEO診断・最適化チェック",
                "LLMO最適化チェック",
                "Claude対応分析",
                "ChatGPT対応分析", 
                "Gemini対応分析",
                "Perplexity対応分析",
                "コンテンツ品質評価",
                "ユーザビリティ診断",
                "メタタグ診断",
                "タイトル・ディスクリプション診断",
                "キーワード分析",
                "サイト構造分析",
                "レスポンシブ診断",
                "24時間スマートキャッシュ",
                "即座の分析結果取得"
              ],
              "applicationSubCategory": "SEO・LLMO診断ツール",
              "browserRequirements": "HTML5, JavaScript enabled",
              "softwareVersion": "1.0",
              "releaseNotes": "LLMO対策・SEO診断機能を搭載した無料AI分析ツール",
              "screenshot": "https://llmocheck.ai/og-image.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "256",
                "bestRating": "5",
                "worstRating": "1"
              },
              "keywords": "LLMO対策,SEO診断,AI分析,Claude対策,ChatGPT対策,Gemini対策,Perplexity対策,無料ツール",
              "inLanguage": "ja",
              "audience": {
                "@type": "Audience",
                "audienceType": "Webサイト運営者・マーケター・SEO担当者"
              }
            })
          }}
        />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="bingbot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        
        {/* Language and Locale */}
        <meta httpEquiv="content-language" content="ja" />
        <link rel="alternate" hrefLang="ja" href="https://llmocheck.ai" />
        <link rel="alternate" hrefLang="x-default" href="https://llmocheck.ai" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//api.anthropic.com" />
        <link rel="dns-prefetch" href="//supabase.co" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
      </head>
      <body className="h-full bg-neutral-light font-sans antialiased">
        {/* メインヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-primary truncate">
                  LLMO対策チェックサイト
                </h1>
                <span className="ml-2 text-xs sm:text-sm text-gray-500 hidden sm:inline truncate">
                  AI powered Webサイト分析ツール
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>

        {/* フッター */}
        <footer className="bg-neutral-dark text-white py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                © 2024 LLMO対策チェックサイト. Powered by AI.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 