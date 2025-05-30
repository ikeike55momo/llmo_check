/**
 * LLMO診断サイト - 結果表示コンポーネント
 * AI診断結果、ローディング状態、エラー表示を管理
 */

'use client';

import ReactMarkdown from 'react-markdown';
import type { DiagnosisResult, FormStatus, ErrorInfo } from '@/types/diagnosis';

/** 結果表示プロパティの型定義 */
interface ResultDisplayProps {
  /** 表示状態 */
  status: FormStatus;
  /** 診断結果データ（成功時） */
  data?: DiagnosisResult;
  /** エラー情報（エラー時） */
  errorInfo?: ErrorInfo;
  /** 新しい診断を開始するためのリセット関数 */
  onReset?: () => void;
}

/**
 * 結果表示コンポーネント
 * 状態に応じて適切なUIを表示
 */
export default function ResultDisplay({ status, data, errorInfo, onReset }: ResultDisplayProps) {
  // アイドル状態では何も表示しない
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      {/* ローディング状態 */}
      {status === 'loading' && (
        <div className="result-card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI分析中...
              </h3>
              <p className="text-gray-600">
                WebサイトのコンテンツをAIが詳細に分析しています。<br />
                しばらくお待ちください。
              </p>
              <div className="mt-4 bg-gray-100 rounded-lg p-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  キャッシュされた結果がある場合は数秒で完了します
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功状態 */}
      {status === 'success' && data && (
        <div className="result-card">
          {/* 結果ヘッダー */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  AI診断レポート
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">対象URL:</span>
                  <a 
                    href={data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1.5 text-primary hover:underline font-medium truncate max-w-sm"
                  >
                    {data.url}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{new Date(data.analyzedAt).toLocaleString('ja-JP')}</span>
                </div>
                
                {data.cached && (
                  <div className="flex items-center px-3 py-1 rounded-full text-xs bg-secondary/10 text-secondary font-medium">
                    <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    キャッシュ使用
                  </div>
                )}
              </div>
            </div>
            
            {/* リセットボタン */}
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ml-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新しい診断
              </button>
            )}
          </div>

          {/* 診断結果本文 */}
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary/20">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded mr-3"></div>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6 pl-4 border-l-4 border-secondary">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4 text-base">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-2 mb-4 ml-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start text-gray-700">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="leading-relaxed">{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 bg-yellow-50 px-1 py-0.5 rounded">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 text-accent px-2 py-1 rounded font-mono text-sm">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-gray-50 rounded-r italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {data.analysis}
            </ReactMarkdown>
          </div>

          {/* フッター情報 */}
          <div className="mt-8 pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                この診断結果は Claude Sonnet 4 AI によって生成されました
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600">
                  {data.cached ? 'キャッシュ使用' : '新規分析'}
                </span>
                <span className="text-xs text-gray-500">
                  24時間有効
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* エラー状態 */}
      {status === 'error' && (
        <div className="result-card border-accent/20">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              診断エラーが発生しました
            </h3>
            <p className="text-gray-600 mb-4">
              {errorInfo?.message || ' 診断処理中に予期しないエラーが発生しました。'}
            </p>
            
            {/* エラー詳細（コードがある場合） */}
            {errorInfo?.code && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  エラーコード: <code className="bg-white px-2 py-1 rounded text-accent font-mono">{errorInfo.code}</code>
                </p>
              </div>
            )}

            {/* 再試行ボタン */}
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再試行
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 