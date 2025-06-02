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

/** サイトのメタデータ設定 */
export const metadata: Metadata = {
  title: 'LLMO診断サイト - AI powered Webサイト分析ツール',
  description: 'あらゆるWebサイトのURLを入力するだけで、AI（Claude Sonnet 4）による詳細な分析結果を即座に取得できます。SEO、コンテンツ構造、ユーザビリティを総合的に診断します。',
  keywords: ['ウェブサイト分析', 'SEO診断', 'AI分析', 'Claude', 'サイト診断'],
  authors: [{ name: 'LLMO診断サイト運営チーム' }],
  openGraph: {
    title: 'LLMO診断サイト - AI powered Webサイト分析ツール',
    description: 'URLを入力するだけでAIがWebサイトを詳細分析。SEO、コンテンツ、ユーザビリティを総合診断します。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'LLMO診断サイト',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMO診断サイト - AI powered Webサイト分析ツール',
    description: 'URLを入力するだけでAIがWebサイトを詳細分析',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Google Search Console用（後で設定）
    google: '',
  }
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
      </head>
      <body className="h-full bg-neutral-light font-sans antialiased">
        {/* メインヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-primary truncate">
                  LLMO診断サイト
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
                © 2024 LLMO診断サイト. Powered by AI.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 