/**
 * LLMO診断サイト - ログインモーダルコンポーネント
 * ユーザーログイン機能のUIを提供
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginFormData, AuthFormStatus, AuthError } from '@/types/auth';

/** ログインモーダルのプロパティ */
interface LoginModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** 会員登録モーダルに切り替えるコールバック */
  onSwitchToRegister: () => void;
  /** パスワードリセットモーダルに切り替えるコールバック */
  onSwitchToReset: () => void;
}

/**
 * ログインモーダルコンポーネント
 * メールアドレス・パスワードによるログイン機能
 */
export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToReset,
}: LoginModalProps) {
  const { login } = useAuth();
  
  /** フォーム入力データ */
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  /** フォーム状態 */
  const [formStatus, setFormStatus] = useState<AuthFormStatus>('idle');
  
  /** エラー情報 */
  const [error, setError] = useState<AuthError | null>(null);

  /** モーダルが開いていない場合は何も表示しない */
  if (!isOpen) return null;

  /**
   * 入力値変更ハンドラー
   */
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    if (!formData.password.trim()) {
      setError({ message: 'パスワードを入力してください' });
      return;
    }

    setFormStatus('loading');
    setError(null);

    try {
      await login(formData);
      // ログイン成功時は自動的にモーダルが閉じられる
      onClose();
      setFormStatus('success');
    } catch (err) {
      console.error('ログインエラー:', err);
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">ログイン</h2>
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
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="example@email.com"
              autoComplete="email"
              required
            />
          </div>

          {/* パスワード入力 */}
          <div className="mb-6">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="パスワードを入力"
              autoComplete="current-password"
              required
            />
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ログイン中...
              </span>
            ) : (
              'ログイン'
            )}
          </button>

          {/* パスワードリセットリンク */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToReset}
              className="text-sm text-primary hover:text-blue-700 underline transition-colors"
            >
              パスワードを忘れた方はこちら
            </button>
          </div>
        </form>

        {/* フッター */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600 text-center">
            アカウントをお持ちでない方は{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-primary hover:text-blue-700 font-medium underline transition-colors"
            >
              会員登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}