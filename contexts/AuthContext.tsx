/**
 * LLMO診断サイト - 認証コンテキスト
 * アプリケーション全体で認証状態を管理
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  getAuthSupabaseClient,
  createOrUpdateUserProfile,
  getUserProfile,
  updateUserProfile,
  saveDiagnosisHistory,
  getDiagnosisHistory,
  toggleDiagnosisFavorite,
  deleteDiagnosisHistory,
  getUserStats,
  formatAuthError
} from '@/lib/auth';
import type { 
  AuthState, 
  AuthContextValue, 
  UserProfile,
  LoginFormData,
  RegisterFormData,
  ProfileUpdateData,
  PasswordResetData,
  DiagnosisHistoryFilter,
  DiagnosisHistoryResponse,
  UserStats,
  AuthError
} from '@/types/auth';

/** 認証コンテキストの初期値 */
const defaultAuthState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
};

/** 認証コンテキスト */
const AuthContext = createContext<AuthContextValue | null>(null);

/** 認証コンテキストプロバイダーのプロパティ */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認証コンテキストプロバイダー
 * アプリケーション全体で認証状態と機能を提供
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const supabase = getAuthSupabaseClient();

  /**
   * 認証状態を更新
   */
  const updateAuthState = async (user: User | null) => {
    if (!user) {
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
      });
      return;
    }

    try {
      // ユーザープロフィールを取得または作成
      let profile = await getUserProfile(user.id);
      
      if (!profile) {
        // 初回ログインの場合、プロフィールを作成
        profile = await createOrUpdateUserProfile(
          user.id,
          user.email || '',
          user.user_metadata?.display_name
        );
      }

      setAuthState({
        user,
        profile,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('認証状態更新エラー:', error);
      setAuthState({
        user,
        profile: null,
        loading: false,
        isAuthenticated: true, // ユーザーは存在するが、プロフィールに問題
      });
    }
  };

  /**
   * 初期化とセッション監視
   */
  useEffect(() => {
    // 初期セッション取得
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session?.user || null);
      } catch (error) {
        console.error('初期認証エラー:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initAuth();

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        await updateAuthState(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  /**
   * ログイン処理
   */
  const login = async ({ email, password }: LoginFormData): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw formatAuthError(error);
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  /**
   * 会員登録処理
   */
  const register = async ({ 
    email, 
    password, 
    displayName 
  }: RegisterFormData): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName?.trim() || '',
          },
        },
      });

      if (error) {
        throw formatAuthError(error);
      }

      // 成功メッセージは呼び出し元で処理
    } catch (error) {
      console.error('会員登録エラー:', error);
      throw error;
    }
  };

  /**
   * ログアウト処理
   */
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw formatAuthError(error);
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  /**
   * パスワードリセット処理
   */
  const resetPassword = async ({ email }: PasswordResetData): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        throw formatAuthError(error);
      }
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      throw error;
    }
  };

  /**
   * プロフィール更新処理
   */
  const updateProfile = async (data: ProfileUpdateData): Promise<void> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      // パスワード変更がある場合
      if (data.new_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.new_password,
        });

        if (passwordError) {
          throw formatAuthError(passwordError);
        }
      }

      // プロフィール更新
      if (data.display_name !== undefined) {
        const updatedProfile = await updateUserProfile(authState.user.id, {
          display_name: data.display_name.trim() || null,
        });

        setAuthState(prev => ({
          ...prev,
          profile: updatedProfile,
        }));
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  };

  /**
   * 診断履歴の取得
   */
  const getDiagnosisHistoryData = async (
    filter?: DiagnosisHistoryFilter
  ): Promise<DiagnosisHistoryResponse> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      return await getDiagnosisHistory(authState.user.id, filter);
    } catch (error) {
      console.error('診断履歴取得エラー:', error);
      throw error;
    }
  };

  /**
   * 診断履歴の保存
   */
  const saveDiagnosisHistoryData = async (
    url: string, 
    result: string
  ): Promise<void> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      await saveDiagnosisHistory(authState.user.id, url, result);
    } catch (error) {
      console.error('診断履歴保存エラー:', error);
      throw error;
    }
  };

  /**
   * お気に入りの切り替え
   */
  const toggleFavorite = async (historyId: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      // 現在の状態を取得して反転
      const currentHistory = await getDiagnosisHistory(authState.user.id, { limit: 1000 });
      const targetHistory = currentHistory.data.find(h => h.id === historyId);
      
      if (!targetHistory) {
        throw new Error('対象の履歴が見つかりません');
      }

      await toggleDiagnosisFavorite(historyId, !targetHistory.is_favorite);
    } catch (error) {
      console.error('お気に入り切り替えエラー:', error);
      throw error;
    }
  };

  /**
   * 診断履歴の削除
   */
  const deleteDiagnosisHistoryData = async (historyId: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      await deleteDiagnosisHistory(historyId);
    } catch (error) {
      console.error('診断履歴削除エラー:', error);
      throw error;
    }
  };

  /**
   * ユーザー統計の取得
   */
  const getUserStatsData = async (): Promise<UserStats> => {
    if (!authState.user) {
      throw new Error('ログインが必要です');
    }

    try {
      return await getUserStats(authState.user.id);
    } catch (error) {
      console.error('ユーザー統計取得エラー:', error);
      throw error;
    }
  };

  /** コンテキストで提供する値 */
  const contextValue: AuthContextValue = {
    state: authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    getDiagnosisHistory: getDiagnosisHistoryData,
    saveDiagnosisHistory: saveDiagnosisHistoryData,
    toggleFavorite,
    deleteDiagnosisHistory: deleteDiagnosisHistoryData,
    getUserStats: getUserStatsData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するためのカスタムフック
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * 認証状態のみを取得するヘルパーフック
 */
export function useAuthState(): AuthState {
  const { state } = useAuth();
  return state;
}

/**
 * 認証済みユーザーのみがアクセス可能なコンテンツ用フック
 */
export function useRequireAuth(): { user: User; profile: UserProfile } {
  const { state } = useAuth();
  
  if (!state.isAuthenticated || !state.user || !state.profile) {
    throw new Error('このページにアクセスするにはログインが必要です');
  }
  
  return { user: state.user, profile: state.profile };
}