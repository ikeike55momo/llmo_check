/**
 * 診断結果の型定義
 * LLMO診断サイトで使用するデータ構造を定義
 */

/** 診断結果のデータ構造 */
export interface DiagnosisResult {
  /** 診断対象のURL */
  url: string;
  /** AI分析結果のテキスト */
  analysis: string;
  /** 分析実行日時 */
  analyzedAt: string;
  /** キャッシュから取得したかどうか */
  cached: boolean;
  /** ユーザーが認証済みかどうか */
  isAuthenticated?: boolean;
  /** 完全な結果にアクセス可能かどうか */
  hasFullAccess?: boolean;
}

/** 診断APIのリクエスト形式 */
export interface DiagnoseRequest {
  /** 診断対象のURL */
  url: string;
}

/** 診断APIのレスポンス形式 */
export interface DiagnoseResponse {
  /** 診断結果 */
  result: string;
  /** キャッシュから取得したかどうか */
  cached: boolean;
}

/** フォームの状態を表す列挙型 */
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/** エラー情報の構造 */
export interface ErrorInfo {
  /** エラーメッセージ */
  message: string;
  /** エラーコード（オプション） */
  code?: string;
} 