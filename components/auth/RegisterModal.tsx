/**
 * LLMO診断サイト - 会員登録モーダルコンポーネント
 * 新規ユーザー登録機能のUIを提供
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { RegisterFormData, AuthFormStatus, AuthError } from '@/types/auth';

/** 会員登録モーダルのプロパティ */
interface RegisterModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** ログインモーダルに切り替えるコールバック */
  onSwitchToLogin: () => void;
}

/**
 * 会員登録モーダルコンポーネント
 * メールアドレス・パスワードによる新規ユーザー登録機能
 */
export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const { register } = useAuth();
  
  /** フォーム入力データ */
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  
  /** フォーム状態 */
  const [formStatus, setFormStatus] = useState<AuthFormStatus>('idle');
  
  /** エラー情報 */
  const [error, setError] = useState<AuthError | null>(null);
  
  /** 利用規約同意フラグ */
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  /** 登録成功フラグ */
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  /** モーダルが開いていない場合は何も表示しない */
  if (!isOpen) return null;

  /**
   * 入力値変更ハンドラー
   */
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (error) {
      setError(null);
    }
  };

  /**
   * フォームバリデーション
   */
  const validateForm = (): string | null => {
    if (!formData.email.trim()) {
      return 'メールアドレスを入力してください';
    }
    
    if (!formData.email.includes('@')) {
      return '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password.trim()) {
      return 'パスワードを入力してください';
    }
    
    if (formData.password.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'パスワードが一致しません';
    }
    
    if (!agreedToTerms) {
      return '利用規約に同意してください';
    }
    
    return null;
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // バリデーション
    const validationError = validateForm();
    if (validationError) {
      setError({ message: validationError });
      return;
    }

    setFormStatus('loading');
    setError(null);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        displayName: formData.displayName || undefined,
      });
      
      setFormStatus('success');
      setRegistrationSuccess(true);
    } catch (err) {
      console.error('会員登録エラー:', err);
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

  /** 登録成功画面 */
  if (registrationSuccess) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
          {/* 成功ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-green-700">会員登録完了</h2>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              会員登録ありがとうございます！
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              確認メールを <strong>{formData.email}</strong> に送信しました。<br />
              メール内のリンクをクリックして、アカウントを有効化してください。
            </p>
            
            <button
              onClick={onSwitchToLogin}
              className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              ログインページへ
            </button>
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
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">会員登録</h2>
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
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="register-email"
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

          {/* 表示名入力 */}
          <div className="mb-4">
            <label htmlFor="register-display-name" className="block text-sm font-medium text-gray-700 mb-2">
              表示名 <span className="text-gray-400">(オプション)</span>
            </label>
            <input
              id="register-display-name"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="山田太郎"
              autoComplete="name"
              maxLength={50}
            />
          </div>

          {/* パスワード入力 */}
          <div className="mb-4">
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="8文字以上で入力"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              8文字以上の英数字で入力してください
            </p>
          </div>

          {/* パスワード確認入力 */}
          <div className="mb-4">
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード確認 <span className="text-red-500">*</span>
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="パスワードを再度入力"
              autoComplete="new-password"
              required
            />
          </div>

          {/* 利用規約同意 */}
          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="mt-1 mr-3 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                <a href="#" className="text-primary hover:text-blue-700 underline">利用規約</a>
                および
                <a href="#" className="text-primary hover:text-blue-700 underline">プライバシーポリシー</a>
                に同意します <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                登録中...
              </span>
            ) : (
              '会員登録'
            )}
          </button>
        </form>

        {/* フッター */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600 text-center">
            既にアカウントをお持ちの方は{' '}
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