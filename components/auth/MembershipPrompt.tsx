/**
 * LLMO診断サイト - 会員登録促進コンポーネント
 * 非会員ユーザーに会員登録を促すUIを提供
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import PasswordResetModal from './PasswordResetModal';
import type { AuthModalType } from '@/types/auth';

/** 会員登録促進プロンプトのプロパティ */
interface MembershipPromptProps {
  /** 表示する場所の種類（結果エリア、バナー等） */
  variant?: 'banner' | 'inline' | 'overlay';
  /** カスタムメッセージ */
  customMessage?: string;
  /** プロンプトの表示・非表示 */
  show?: boolean;
}

/**
 * 会員登録促進プロンプトコンポーネント
 * 非会員ユーザーに診断結果の完全版を見るための会員登録を促す
 */
export default function MembershipPrompt({ 
  variant = 'banner',
  customMessage,
  show = true 
}: MembershipPromptProps) {
  const { state } = useAuth();
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  // 認証済みユーザーまたは非表示の場合は何も表示しない
  if (state.isAuthenticated || !show) {
    return null;
  }

  /**
   * モーダルを開く
   */
  const openModal = (modalType: AuthModalType) => {
    setActiveModal(modalType);
  };

  /**
   * モーダルを閉じる
   */
  const closeModal = () => {
    setActiveModal(null);
  };

  /** バリアント別のスタイル設定 */
  const getVariantStyles = () => {
    switch (variant) {
      case 'banner':
        return {
          container: "bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 mb-6",
          title: "text-xl font-bold text-gray-900 mb-3",
          message: "text-gray-700 mb-4",
          buttonPrimary: "bg-primary hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors mr-3",
          buttonSecondary: "bg-white hover:bg-gray-50 text-primary border border-primary font-medium px-6 py-3 rounded-lg transition-colors"
        };
      
      case 'inline':
        return {
          container: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4",
          title: "text-lg font-semibold text-gray-900 mb-2",
          message: "text-gray-700 text-sm mb-3",
          buttonPrimary: "bg-primary hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition-colors mr-2",
          buttonSecondary: "bg-white hover:bg-gray-50 text-primary border border-primary font-medium px-4 py-2 rounded text-sm transition-colors"
        };
      
      case 'overlay':
        return {
          container: "absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 rounded-lg",
          title: "text-2xl font-bold text-gray-900 mb-4 text-center",
          message: "text-gray-700 mb-6 text-center max-w-md",
          buttonPrimary: "bg-primary hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors mr-3",
          buttonSecondary: "bg-white hover:bg-gray-50 text-primary border border-primary font-medium px-8 py-3 rounded-lg transition-colors"
        };
      
      default:
        return getVariantStyles(); // fallback to banner
    }
  };

  const styles = getVariantStyles();

  /** デフォルトメッセージ */
  const defaultMessage = customMessage || 
    "詳細な診断結果と具体的な改善提案を見るには、無料の会員登録が必要です。登録は30秒で完了し、今後の診断履歴も保存されます。";

  return (
    <>
      <div className={styles.container}>
        {variant === 'overlay' ? (
          // オーバーレイタイプの場合、中央配置
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h3 className={styles.title}>
              🔒 会員限定コンテンツ
            </h3>
            
            <p className={styles.message}>
              {defaultMessage}
            </p>
            
            <div className="flex justify-center flex-wrap gap-3">
              <button
                onClick={() => openModal('register')}
                className={styles.buttonPrimary}
              >
                無料で会員登録
              </button>
              
              <button
                onClick={() => openModal('login')}
                className={styles.buttonSecondary}
              >
                ログイン
              </button>
            </div>
          </div>
        ) : (
          // バナー・インラインタイプの場合
          <>
            <div className="flex items-start">
              {/* アイコン */}
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className={styles.title}>
                  🎯 より詳細な診断結果をご覧ください
                </h3>
                
                <p className={styles.message}>
                  {defaultMessage}
                </p>
                
                {/* 特典リスト */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>詳細な改善提案</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>具体的なコード例</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>診断履歴の保存</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>お気に入り機能</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openModal('register')}
                    className={styles.buttonPrimary}
                  >
                    🚀 無料で会員登録（30秒）
                  </button>
                  
                  <button
                    onClick={() => openModal('login')}
                    className={styles.buttonSecondary}
                  >
                    ログイン
                  </button>
                </div>
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