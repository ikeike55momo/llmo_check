/**
 * LLMO診断サイト - 診断フォームコンポーネント
 * URL入力、バリデーション、送信機能を提供
 */

'use client';

import { useState } from 'react';
import type { FormStatus } from '@/types/diagnosis';

/** フォームプロパティの型定義 */
interface DiagnoseFormProps {
  /** 診断実行時のコールバック関数 */
  onDiagnose: (url: string) => Promise<void>;
  /** フォームの現在の状態 */
  status: FormStatus;
}

/** URL検証用の正規表現パターン */
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

/**
 * 診断フォームコンポーネント
 * URL入力とクライアントサイドバリデーション機能を提供
 */
export default function DiagnoseForm({ onDiagnose, status }: DiagnoseFormProps) {
  /** 入力されたURL */
  const [inputUrl, setInputUrl] = useState<string>('');
  /** バリデーションエラーメッセージ */
  const [validationError, setValidationError] = useState<string>('');

  /**
   * URL入力値の変更ハンドラー
   * リアルタイムでバリデーションを実行
   */
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setInputUrl(newUrl);
    
    // バリデーションエラーをクリア
    if (validationError) {
      setValidationError('');
    }
  };

  /**
   * URL形式の検証を実行
   */
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setValidationError('URLを入力してください。');
      return false;
    }

    if (!URL_PATTERN.test(url)) {
      setValidationError('有効なURL形式で入力してください。（例: https://example.com）');
      return false;
    }

    return true;
  };

  /**
   * フォーム送信ハンドラー
   * バリデーション後、親コンポーネントに診断実行を委譲
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // バリデーション実行
    if (!validateUrl(inputUrl)) {
      return;
    }

    // URLを正規化（プロトコルがない場合はhttpsを追加）
    let normalizedUrl = inputUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // 診断実行
    try {
      await onDiagnose(normalizedUrl);
    } catch (error) {
      console.error('診断実行エラー:', error);
    }
  };

  /** ローディング状態の判定 */
  const isLoading = status === 'loading';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="diagnose-form">
        {/* フォームタイトル */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Webサイト診断を開始
          </h2>
          <p className="text-gray-600">
            分析したいWebサイトのURLを入力してください。AIが詳細な診断結果を提供します。
          </p>
        </div>

        {/* URL入力フィールド */}
        <div className="mb-4">
          <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
            WebサイトURL <span className="text-accent">*</span>
          </label>
          <input
            id="website-url"
            type="text"
            value={inputUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            className={`diagnose-input ${validationError ? 'border-accent focus:ring-accent' : ''}`}
            disabled={isLoading}
            autoComplete="url"
            aria-describedby={validationError ? "url-error" : undefined}
          />
          
          {/* バリデーションエラー表示 */}
          {validationError && (
            <p id="url-error" className="error-message" role="alert">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationError}
            </p>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading || !inputUrl.trim()}
          className="diagnose-button"
          aria-describedby="submit-button-help"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              診断中...
            </span>
          ) : (
            '診断開始'
          )}
        </button>

        {/* ヘルプテキスト */}
        <p id="submit-button-help" className="text-xs text-gray-500 mt-2 text-center">
          診断には数秒から数十秒かかる場合があります
        </p>
      </form>
    </div>
  );
} 