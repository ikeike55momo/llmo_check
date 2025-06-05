/**
 * LLMO診断サイト - メインページ
 * フォームと結果表示を統合し、状態管理を行う
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import DiagnoseForm from '@/components/DiagnoseForm';
import ResultDisplay from '@/components/ResultDisplay';
import type { DiagnosisResult, FormStatus, ErrorInfo } from '@/types/diagnosis';

/**
 * メインページコンポーネント
 * アプリケーション全体の状態管理と診断フローを制御
 */
export default function HomePage() {
  /** フォームの現在の状態 */
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  /** 診断結果データ */
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | undefined>(undefined);
  /** エラー情報 */
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

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
      // 診断API呼び出し
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* メインヘッダー - SEO最適化済み */}
        <div className="text-center mb-10 sm:mb-16">
          {/* ロゴエリア */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-40 sm:w-52 md:w-64 lg:w-72 xl:w-80">
              <Image
                src="/logo.png"
                alt="LLMO対策チェック"
                width={320}
                height={320}
                className="w-full h-auto"
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            AIによる無料AI Webサイト診断ツール
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 mb-6">
            <strong>AI</strong>を活用して、あらゆるWebサイトの<strong>SEO最適化</strong>、<strong>LLMO対応度</strong>、
            コンテンツ構造、ユーザビリティを包括的に分析します。URLを入力するだけで、
            プロフェッショナルレベルの<strong>診断結果</strong>を即座に取得できます。
          </p>
          
          {/* 主要キーワードとベネフィット */}
          <div className="hidden sm:block text-sm text-gray-500 max-w-4xl mx-auto mb-8">
            <p className="mb-2">
              🔍 <strong>SEO診断</strong> | 🤖 <strong>AI分析</strong> | 📊 <strong>LLMO最適化</strong> | 💯 <strong>無料ツール</strong>
            </p>
            <p className="italic">
              検索エンジン最適化からAI検索対応まで、現代のWebサイトに必要な全ての要素を一括診断
            </p>
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            📋 診断の使い方ガイド
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">URLを入力</h3>
              <p className="text-sm text-gray-600">
                診断したいWebサイトのURLを入力フィールドに貼り付けてください
              </p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI分析実行</h3>
              <p className="text-sm text-gray-600">
                AIが数秒〜数十秒でサイトを詳細分析します
              </p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">改善案を取得</h3>
              <p className="text-sm text-gray-600">
                SEO・LLMO・ユーザビリティの具体的な改善提案をレポートで確認
              </p>
            </div>
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
        <section className="mt-16 sm:mt-20 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              🤖 LLMO診断サイトとは？AI時代の新しいWebサイト分析
            </h2>
            
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 なぜLLMO最適化が重要なのか</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-5">
                  <strong>LLMO（Large Language Model Optimization）</strong>とは、ChatGPT、Claude、Gemini、Perplexityなどの
                  AI検索エンジンにWebサイトが適切に理解・引用されるための最適化手法です。
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-8 space-y-3 sm:space-y-0 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <span className="text-blue-500 mr-3">●</span>
                    <span>AI検索での上位表示確率向上</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-blue-500 mr-3">●</span>
                    <span>コンテンツの引用可能性アップ</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-blue-500 mr-3">●</span>
                    <span>構造化された情報提供の実現</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 機能紹介 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">即座の分析</h3>
              <p className="text-sm text-gray-600">
                URLを入力するだけで、数秒から数十秒で詳細な診断結果を取得
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">高精度AI分析</h3>
              <p className="text-sm text-gray-600">
                最先端のAI技術で正確な診断を実施
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">スマートキャッシュ</h3>
              <p className="text-sm text-gray-600">
                24時間以内の結果はキャッシュから高速取得
              </p>
            </div>
          </div>
          
          {/* プライバシーとセキュリティ */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto px-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                🔒 プライバシーとセキュリティ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-600 max-w-3xl mx-auto">
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-secondary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>個人情報は一切収集しません</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-secondary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>全通信はHTTPS暗号化済み</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-secondary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  <span>24時間高速キャッシュシステム</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-secondary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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