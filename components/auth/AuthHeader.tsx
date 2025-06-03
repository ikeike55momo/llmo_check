/**
 * LLMO診断サイト - 認証ヘッダーコンポーネント
 * ヘッダー部分の認証状態表示とモーダル管理
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import PasswordResetModal from './PasswordResetModal';
import type { AuthModalType } from '@/types/auth';

/**
 * 認証ヘッダーコンポーネント
 * ログイン状態に応じてUI表示を切り替え、認証モーダルを管理
 */
export default function AuthHeader() {
  const { state, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /**
   * モーダルを開く
   */
  const openModal = (modalType: AuthModalType) => {
    setActiveModal(modalType);
    setUserMenuOpen(false); // ユーザーメニューを閉じる
  };

  /**
   * モーダルを閉じる
   */
  const closeModal = () => {
    setActiveModal(null);
  };

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  /**
   * ユーザーメニューの外側クリックで閉じる
   */
  const handleUserMenuBackdrop = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setUserMenuOpen(false);
    }
  };

  /** ローディング中の表示 */
  if (state.loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  /** 認証済みユーザーの表示 */
  if (state.isAuthenticated && state.user && state.profile) {
    return (
      <>
        <div className="relative">
          {/* ユーザー情報表示 */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            {/* ユーザーアバター */}
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {state.profile.display_name 
                  ? state.profile.display_name.charAt(0).toUpperCase()
                  : state.profile.email.charAt(0).toUpperCase()
                }
              </span>
            </div>
            
            {/* ユーザー名 */}
            <span className="hidden sm:block">
              {state.profile.display_name || '会員'}
            </span>
            
            {/* ドロップダウンアイコン */}
            <svg 
              className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* ユーザーメニュードロップダウン */}
          {userMenuOpen && (
            <>
              {/* 背景オーバーレイ（モバイル用） */}
              <div 
                className="fixed inset-0 z-40 md:hidden" 
                onClick={handleUserMenuBackdrop}
              ></div>
              
              {/* メニュー */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* プロフィール情報 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {state.profile.display_name || '未設定'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {state.profile.email}
                  </p>
                </div>
                
                {/* メニュー項目 */}
                <button
                  onClick={() => {
                    // TODO: ダッシュボードページへの遷移
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  📊 診断履歴
                </button>
                
                <button
                  onClick={() => {
                    // TODO: プロフィール設定ページへの遷移
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ⚙️ アカウント設定
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 ログアウト
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 認証モーダル群 */}
        <LoginModal
          isOpen={activeModal === 'login'}
          onClose={closeModal}
          onSwitchToRegister={() => openModal('register')}
          onSwitchToReset={() => openModal('reset')}
        />
        
        <RegisterModal
          isOpen={activeModal === 'register'}
          onClose={closeModal}
          onSwitchToLogin={() => openModal('login')}
        />
        
        <PasswordResetModal
          isOpen={activeModal === 'reset'}
          onClose={closeModal}
          onSwitchToLogin={() => openModal('login')}
        />
      </>
    );
  }

  /** 未認証ユーザーの表示 */
  return (
    <>
      <div className="flex items-center space-x-3">
        {/* ログインボタン */}
        <button
          onClick={() => openModal('login')}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ログイン
        </button>
        
        {/* 会員登録ボタン */}
        <button
          onClick={() => openModal('register')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors"
        >
          会員登録
        </button>
      </div>

      {/* 認証モーダル群 */}
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToRegister={() => openModal('register')}
        onSwitchToReset={() => openModal('reset')}
      />
      
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={closeModal}
        onSwitchToLogin={() => openModal('login')}
      />
      
      <PasswordResetModal
        isOpen={activeModal === 'reset'}
        onClose={closeModal}
        onSwitchToLogin={() => openModal('login')}
      />
    </>
  );
}