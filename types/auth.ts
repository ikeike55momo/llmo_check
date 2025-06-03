/**
 * 認証関連の型定義
 * Supabase認証システムとの統合用型定義
 */

import type { User } from '@supabase/supabase-js';

/** ユーザープロフィール情報 */
export interface UserProfile {
  /** ユーザーID（Supabase auth.users.id と同期） */
  id: string;
  /** メールアドレス */
  email: string;
  /** 表示名（オプション） */
  display_name?: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 診断履歴のデータ構造 */
export interface DiagnosisHistory {
  /** 履歴ID */
  id: string;
  /** ユーザーID */
  user_id: string;
  /** 診断対象URL */
  url: string;
  /** 診断結果（完全版） */
  diagnosis_result: string;
  /** お気に入りフラグ */
  is_favorite: boolean;
  /** 診断実行日時 */
  created_at: string;
}

/** 認証状態の管理 */
export interface AuthState {
  /** 認証済みユーザー情報 */
  user: User | null;
  /** ユーザープロフィール情報 */
  profile: UserProfile | null;
  /** ローディング状態 */
  loading: boolean;
  /** 認証状態（true: ログイン済み, false: 未ログイン） */
  isAuthenticated: boolean;
}

/** ログインフォームの入力データ */
export interface LoginFormData {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/** 会員登録フォームの入力データ */
export interface RegisterFormData {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
  /** パスワード確認 */
  confirmPassword: string;
  /** 表示名（オプション） */
  displayName?: string;
}

/** プロフィール更新フォームの入力データ */
export interface ProfileUpdateData {
  /** 表示名 */
  display_name?: string;
  /** 新しいパスワード（変更時） */
  new_password?: string;
  /** 現在のパスワード（変更時の確認用） */
  current_password?: string;
}

/** パスワードリセットフォームの入力データ */
export interface PasswordResetData {
  /** メールアドレス */
  email: string;
}

/** 認証関連のエラー情報 */
export interface AuthError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code?: string;
  /** エラーの詳細情報 */
  details?: string;
}

/** 認証フォームの状態 */
export type AuthFormStatus = 
  | 'idle'          // 初期状態
  | 'loading'       // 処理中
  | 'success'       // 成功
  | 'error';        // エラー

/** 認証モーダルの種類 */
export type AuthModalType = 
  | 'login'         // ログインモーダル
  | 'register'      // 会員登録モーダル
  | 'reset'         // パスワードリセットモーダル
  | null;           // モーダル非表示

/** 診断結果のアクセス制御情報 */
export interface DiagnosisAccessInfo {
  /** ユーザーが認証済みかどうか */
  isAuthenticated: boolean;
  /** 完全な結果にアクセス可能かどうか */
  hasFullAccess: boolean;
  /** 制限されたコンテンツの理由 */
  accessLimitReason?: string;
}

/** 会員登録促進のメッセージ情報 */
export interface MembershipPrompt {
  /** 表示するメッセージ */
  message: string;
  /** CTAボタンのテキスト */
  ctaText: string;
  /** CTAボタンのアクション */
  ctaAction: () => void;
}

/** 診断履歴の検索・フィルタ条件 */
export interface DiagnosisHistoryFilter {
  /** URL による部分一致検索 */
  urlSearch?: string;
  /** お気に入りのみ表示 */
  favoritesOnly?: boolean;
  /** 開始日（期間絞り込み） */
  startDate?: string;
  /** 終了日（期間絞り込み） */
  endDate?: string;
  /** ページネーション：ページ番号 */
  page?: number;
  /** ページネーション：1ページあたりの件数 */
  limit?: number;
}

/** 診断履歴の一覧取得結果 */
export interface DiagnosisHistoryResponse {
  /** 診断履歴の配列 */
  data: DiagnosisHistory[];
  /** 総件数 */
  total: number;
  /** 現在のページ */
  page: number;
  /** 1ページあたりの件数 */
  limit: number;
  /** 次のページがあるかどうか */
  hasNext: boolean;
}

/** ユーザー統計情報 */
export interface UserStats {
  /** 総診断回数 */
  totalDiagnoses: number;
  /** お気に入り登録数 */
  totalFavorites: number;
  /** 最後の診断日時 */
  lastDiagnosisAt?: string;
  /** 会員登録日時 */
  memberSince: string;
}

/** Supabase認証イベントの型 */
export type AuthEventType = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

/** 認証コンテキストで提供される機能 */
export interface AuthContextValue {
  /** 現在の認証状態 */
  state: AuthState;
  
  /** ログイン処理 */
  login: (data: LoginFormData) => Promise<void>;
  
  /** 会員登録処理 */
  register: (data: RegisterFormData) => Promise<void>;
  
  /** ログアウト処理 */
  logout: () => Promise<void>;
  
  /** パスワードリセット処理 */
  resetPassword: (data: PasswordResetData) => Promise<void>;
  
  /** プロフィール更新処理 */
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  
  /** 診断履歴の取得 */
  getDiagnosisHistory: (filter?: DiagnosisHistoryFilter) => Promise<DiagnosisHistoryResponse>;
  
  /** 診断履歴の保存 */
  saveDiagnosisHistory: (url: string, result: string) => Promise<void>;
  
  /** お気に入りの切り替え */
  toggleFavorite: (historyId: string) => Promise<void>;
  
  /** 診断履歴の削除 */
  deleteDiagnosisHistory: (historyId: string) => Promise<void>;
  
  /** ユーザー統計の取得 */
  getUserStats: () => Promise<UserStats>;
}