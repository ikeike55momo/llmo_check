/**
 * LLMO診断サイト - メインページ
 * フォームと結果表示を統合し、状態管理を行う
 */

'use client';

import { useState } from 'react';
import DiagnoseForm from '@/components/DiagnoseForm';
import ResultDisplay from '@/components/ResultDisplay';
import AuthHeader from '@/components/auth/AuthHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import type { DiagnosisResult, FormStatus, ErrorInfo } from '@/types/diagnosis';

/**
 * メインページコンポーネント
 * アプリケーション全体の状態管理と診断フローを制御
 */
function HomePageContent() {
  /** フォームの現在の状態 */
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  /** 診断結果データ */
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | undefined>(undefined);
  /** エラー情報 */
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

  const { state } = useAuth();

  /**
   * 診断実行ハンドラー
   * APIを呼び出し、結果を状態に反映
   */
  const handleDiagnose = async (url: string): Promise<void> => {
    // 状態をリセット
    setFormStatus('loading');
    setDiagnosisResult(undefined);
    setErrorInfo(undefined);

    try {
      // 認証トークンの取得
      let authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (state.isAuthenticated && state.user) {
        // 認証済みユーザーの場合、Authorizationヘッダーを追加
        try {
          const { getAuthSupabaseClient } = await import('@/lib/auth');
          const supabase = getAuthSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            authHeaders.Authorization = `Bearer ${session.access_token}`;
          }
        } catch (authError) {
          console.warn('認証トークン取得エラー:', authError);
          // 認証エラーがあっても診断は続行（匿名として処理）
        }
      }

      // 診断API呼び出し
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `診断API呼び出しに失敗しました (${response.status})`);
      }

      const responseData = await response.json();
      
      // 診断結果を状態に設定
      const result: DiagnosisResult = {
        url: url,
        analysis: responseData.result,
        analyzedAt: new Date().toISOString(),
        cached: responseData.cached || false,
        isAuthenticated: responseData.isAuthenticated || false,
        hasFullAccess: responseData.hasFullAccess || false,
      };

      setDiagnosisResult(result);
      setFormStatus('success');

    } catch (error) {
      console.error('診断エラー:', error);
      
      // エラー情報を設定
      setErrorInfo({
        message: error instanceof Error ? error.message : '診断処理中にエラーが発生しました',
        code: error instanceof Error && 'code' in error ? String(error.code) : undefined,
      });
      setFormStatus('error');
    }
  };

  /**
   * 状態リセットハンドラー
   * 新しい診断を開始するために状態を初期化
   */
  const handleReset = (): void => {
    setFormStatus('idle');
    setDiagnosisResult(undefined);
    setErrorInfo(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        {/* 認証ヘッダー */}
        <div className="flex justify-end mb-6">
          <AuthHeader />
        </div>

        {/* メインヘッダー - SEO最適化済み */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Claude Sonnet 4による無料AI Webサイト診断ツール
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 mb-4">
            <strong>Claude Sonnet 4 AI</strong>を活用して、あらゆるWebサイトの<strong>SEO最適化</strong>、<strong>LLMO対応度</strong>、
            コンテンツ構造、ユーザビリティを包括的に分析します。URLを入力するだけで、
            プロフェッショナルレベルの<strong>無料診断結果</strong>を即座に取得できます。
          </p>
          
          {/* 主要キーワードとベネフィット */}
          <div className="hidden sm:block text-sm text-gray-500 max-w-4xl mx-auto mb-6">
            <p className="mb-2">
              🔍 <strong>SEO診断</strong> | 🤖 <strong>AI分析</strong> | 📊 <strong>LLMO最適化</strong> | 💯 <strong>無料ツール</strong>
            </p>
            <p className="italic">
              検索エンジン最適化からAI検索対応まで、現代のWebサイトに必要な全ての要素を一括診断
            </p>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-5xl mx-auto">
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">即座の分析</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              URLを入力するだけで、数秒から数十秒で詳細な診断結果を取得
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">高精度AI分析</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Claude Sonnet 4による最先端のAI技術で正確な診断を実施
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200 sm:col-span-2 md:col-span-1">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">スマートキャッシュ</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              24時間以内の結果はキャッシュから高速取得
            </p>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="max-w-6xl mx-auto">
          {/* 診断フォーム */}
          <DiagnoseForm onDiagnose={handleDiagnose} status={formStatus} />
          
          {/* 結果表示 */}
          <ResultDisplay
            status={formStatus}
            data={diagnosisResult}
            errorInfo={errorInfo}
            onReset={handleReset}
          />
        </div>

        {/* LLMO最適化のための詳細情報セクション */}
        <section className="mt-12 sm:mt-16 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
              🤖 LLMO診断サイトとは？AI時代の新しいWebサイト分析
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 なぜLLMO最適化が重要なのか</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                  <strong>LLMO（Large Language Model Optimization）</strong>とは、ChatGPT、Claude、Gemini、Perplexityなどの
                  AI検索エンジンにWebサイトが適切に理解・引用されるための最適化手法です。
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">●</span>
                    <span>AI検索での上位表示確率向上</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">●</span>
                    <span>コンテンツの引用可能性アップ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">●</span>
                    <span>構造化された情報提供の実現</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">⚡ Claude Sonnet 4による高精度分析</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                  最新の<strong>Claude Sonnet 4</strong>を使用して、従来のSEOツールでは不可能だった
                  AI視点でのコンテンツ品質評価を実現しています。
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">●</span>
                    <span>セマンティック要素の詳細分析</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">●</span>
                    <span>コンテンツ階層構造の最適化提案</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">●</span>
                    <span>ユーザーインテントとの整合性チェック</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 使い方ガイド */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
              📋 診断の使い方ガイド
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">URLを入力</h3>
                <p className="text-sm text-gray-600">
                  診断したいWebサイトのURLを入力フィールドに貼り付けてください
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI分析実行</h3>
                <p className="text-sm text-gray-600">
                  Claude Sonnet 4が数秒〜数十秒でサイトを詳細分析します
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">改善案を取得</h3>
                <p className="text-sm text-gray-600">
                  SEO・LLMO・ユーザビリティの具体的な改善提案をレポートで確認
                </p>
              </div>
            </div>
          </div>
          
          {/* プライバシーとセキュリティ */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto px-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                🔒 プライバシーとセキュリティ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start justify-center sm:justify-start">
                  <svg className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>個人情報は一切収集しません</span>
                </div>
                <div className="flex items-start justify-center sm:justify-start">
                  <svg className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>全通信はHTTPS暗号化済み</span>
                </div>
                <div className="flex items-start justify-center sm:justify-start">
                  <svg className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  <span>24時間高速キャッシュシステム</span>
                </div>
                <div className="flex items-start justify-center sm:justify-start">
                  <svg className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>完全無料・アカウント登録不要</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * 認証プロバイダーでラップしたメインページコンポーネント
 */
export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
} 