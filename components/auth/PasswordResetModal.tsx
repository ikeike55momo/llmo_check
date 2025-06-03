/**
 * LLMO診断サイト - パスワードリセットモーダルコンポーネント
 * パスワードリセット機能のUIを提供
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PasswordResetData, AuthFormStatus, AuthError } from '@/types/auth';

/** パスワードリセットモーダルのプロパティ */
interface PasswordResetModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** ログインモーダルに切り替えるコールバック */
  onSwitchToLogin: () => void;
}

/**
 * パスワードリセットモーダルコンポーネント
 * メールアドレスによるパスワードリセット機能
 */
export default function PasswordResetModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: PasswordResetModalProps) {
  const { resetPassword } = useAuth();
  
  /** フォーム入力データ */
  const [formData, setFormData] = useState<PasswordResetData>({
    email: '',
  });
  
  /** フォーム状態 */
  const [formStatus, setFormStatus] = useState<AuthFormStatus>('idle');
  
  /** エラー情報 */
  const [error, setError] = useState<AuthError | null>(null);
  
  /** リセット送信成功フラグ */
  const [resetSent, setResetSent] = useState(false);

  /** モーダルが開いていない場合は何も表示しない */
  if (!isOpen) return null;

  /**
   * 入力値変更ハンドラー
   */
  const handleInputChange = (value: string) => {
    setFormData({ email: value });
    // エラーをクリア
    if (error) {
      setError(null);
    }
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // バリデーション
    if (!formData.email.trim()) {
      setError({ message: 'メールアドレスを入力してください' });
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError({ message: '有効なメールアドレスを入力してください' });
      return;
    }

    setFormStatus('loading');
    setError(null);

    try {
      await resetPassword(formData);
      setFormStatus('success');
      setResetSent(true);
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError(err as AuthError);
      setFormStatus('error');
    }
  };

  /**
   * モーダル背景クリックでモーダルを閉じる
   */
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /** ローディング状態の判定 */
  const isLoading = formStatus === 'loading';

  /** リセット送信成功画面 */
  if (resetSent) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
          {/* 成功ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-green-700">リセットメール送信完了</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="モーダルを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 成功メッセージ */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              パスワードリセットメールを送信しました
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              <strong>{formData.email}</strong> にパスワードリセット用のメールを送信しました。<br />
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            
            <div className="space-y-3">
              <button
                onClick={onSwitchToLogin}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                ログインページへ戻る
              </button>
              
              <button
                onClick={() => {
                  setResetSent(false);
                  setFormStatus('idle');
                }}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                別のメールアドレスで再送信
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">パスワードリセット</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 説明テキスト */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              ご登録いただいているメールアドレスを入力してください。<br />
              パスワードリセット用のメールをお送りします。
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          )}

          {/* メールアドレス入力 */}
          <div className="mb-6">
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="reset-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="example@email.com"
              autoComplete="email"
              required
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isLoading || !formData.email.trim()}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                送信中...
              </span>
            ) : (
              'リセットメールを送信'
            )}
          </button>
        </form>

        {/* フッター */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600 text-center">
            パスワードを思い出した方は{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-blue-700 font-medium underline transition-colors"
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}