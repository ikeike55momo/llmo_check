/**
 * LLMO診断サイト - 認証ユーティリティ
 * Supabase認証システムとの統合機能
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  UserProfile, 
  DiagnosisHistory, 
  DiagnosisHistoryFilter, 
  DiagnosisHistoryResponse,
  UserStats,
  AuthError 
} from '@/types/auth';

/** 認証用Supabaseクライアント */
let authSupabaseClient: SupabaseClient | null = null;

/**
 * 認証用Supabaseクライアントを取得
 * クライアントサイドとサーバーサイドの両方で使用可能
 */
export function getAuthSupabaseClient(): SupabaseClient {
  if (authSupabaseClient) {
    return authSupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数が設定されていません');
  }

  authSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return authSupabaseClient;
}

/**
 * サーバーサイド用Supabaseクライアントを取得
 * RLS回避が必要な管理操作で使用
 */
export function getServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY環境変数が設定されていません');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * ユーザープロフィールを作成または更新
 * 初回ログイン時に自動実行
 */
export async function createOrUpdateUserProfile(
  userId: string, 
  email: string, 
  displayName?: string
): Promise<UserProfile> {
  const supabase = getAuthSupabaseClient();

  const profileData = {
    id: userId,
    email: email,
    display_name: displayName || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    console.error('プロフィール作成/更新エラー:', error);
    throw new Error(`プロフィールの作成に失敗しました: ${error.message}`);
  }

  return data as UserProfile;
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getAuthSupabaseClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // プロフィールが存在しない
      return null;
    }
    console.error('プロフィール取得エラー:', error);
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`);
  }

  return data as UserProfile;
}

/**
 * プロフィールを更新
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<UserProfile, 'display_name'>>
): Promise<UserProfile> {
  const supabase = getAuthSupabaseClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('プロフィール更新エラー:', error);
    throw new Error(`プロフィールの更新に失敗しました: ${error.message}`);
  }

  return data as UserProfile;
}

/**
 * 診断履歴を保存
 */
export async function saveDiagnosisHistory(
  userId: string, 
  url: string, 
  result: string
): Promise<DiagnosisHistory> {
  const supabase = getAuthSupabaseClient();

  const historyData = {
    user_id: userId,
    url: url,
    diagnosis_result: result,
    is_favorite: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('diagnosis_history')
    .insert(historyData)
    .select()
    .single();

  if (error) {
    console.error('診断履歴保存エラー:', error);
    throw new Error(`診断履歴の保存に失敗しました: ${error.message}`);
  }

  return data as DiagnosisHistory;
}

/**
 * 診断履歴を取得（フィルタ・ページネーション対応）
 */
export async function getDiagnosisHistory(
  userId: string, 
  filter: DiagnosisHistoryFilter = {}
): Promise<DiagnosisHistoryResponse> {
  const supabase = getAuthSupabaseClient();

  const { 
    urlSearch, 
    favoritesOnly, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = filter;

  // ベースクエリ
  let query = supabase
    .from('diagnosis_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // フィルタ条件の適用
  if (urlSearch && urlSearch.trim()) {
    query = query.ilike('url', `%${urlSearch.trim()}%`);
  }

  if (favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  // ページネーション
  const offset = (page - 1) * limit;
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('診断履歴取得エラー:', error);
    throw new Error(`診断履歴の取得に失敗しました: ${error.message}`);
  }

  const total = count || 0;
  const hasNext = offset + limit < total;

  return {
    data: data as DiagnosisHistory[],
    total,
    page,
    limit,
    hasNext,
  };
}

/**
 * お気に入り状態を切り替え
 */
export async function toggleDiagnosisFavorite(
  historyId: string, 
  isFavorite: boolean
): Promise<DiagnosisHistory> {
  const supabase = getAuthSupabaseClient();

  const { data, error } = await supabase
    .from('diagnosis_history')
    .update({ is_favorite: isFavorite })
    .eq('id', historyId)
    .select()
    .single();

  if (error) {
    console.error('お気に入り更新エラー:', error);
    throw new Error(`お気に入りの更新に失敗しました: ${error.message}`);
  }

  return data as DiagnosisHistory;
}

/**
 * 診断履歴を削除
 */
export async function deleteDiagnosisHistory(historyId: string): Promise<void> {
  const supabase = getAuthSupabaseClient();

  const { error } = await supabase
    .from('diagnosis_history')
    .delete()
    .eq('id', historyId);

  if (error) {
    console.error('診断履歴削除エラー:', error);
    throw new Error(`診断履歴の削除に失敗しました: ${error.message}`);
  }
}

/**
 * ユーザー統計情報を取得
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = getAuthSupabaseClient();

  // 診断履歴の統計を取得
  const { data: historyStats, error: historyError } = await supabase
    .from('diagnosis_history')
    .select('created_at, is_favorite')
    .eq('user_id', userId);

  if (historyError) {
    console.error('診断統計取得エラー:', historyError);
    throw new Error(`統計情報の取得に失敗しました: ${historyError.message}`);
  }

  // プロフィール情報を取得（会員登録日）
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('プロフィール取得エラー:', profileError);
    throw new Error(`プロフィール情報の取得に失敗しました: ${profileError.message}`);
  }

  const totalDiagnoses = historyStats.length;
  const totalFavorites = historyStats.filter(h => h.is_favorite).length;
  const lastDiagnosisAt = historyStats.length > 0 ? 
    Math.max(...historyStats.map(h => new Date(h.created_at).getTime())) : null;

  return {
    totalDiagnoses,
    totalFavorites,
    lastDiagnosisAt: lastDiagnosisAt ? new Date(lastDiagnosisAt).toISOString() : undefined,
    memberSince: profile.created_at,
  };
}

/**
 * 現在のユーザーがログイン済みかチェック
 */
export async function getCurrentUser() {
  const supabase = getAuthSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('ユーザー取得エラー:', error);
    return null;
  }
  
  return user;
}

/**
 * 診断結果のアクセス制御チェック
 */
export function checkDiagnosisAccess(isAuthenticated: boolean) {
  return {
    isAuthenticated,
    hasFullAccess: isAuthenticated,
    accessLimitReason: isAuthenticated ? undefined : '詳細な診断結果を見るには会員登録が必要です',
  };
}

/**
 * 診断結果のフィルタリング（非会員向け）
 * Markdown形式の診断結果から評価部分のみ抽出し、詳細部分を伏字に置換
 */
export function filterDiagnosisForAnonymous(fullResult: string): string {
  const lines = fullResult.split('\n');
  const filteredLines: string[] = [];
  let inRestrictedSection = false;
  
  for (const line of lines) {
    // 見出し（#）は表示
    if (line.startsWith('#')) {
      filteredLines.push(line);
      // 詳細セクションの開始判定
      inRestrictedSection = line.toLowerCase().includes('詳細') || 
                           line.toLowerCase().includes('改善') ||
                           line.toLowerCase().includes('提案') ||
                           line.toLowerCase().includes('具体');
      continue;
    }
    
    // 評価スコア・数値は表示
    if (line.match(/\d+(\.\d+)?[%点]|[A-F]評価|スコア:|評価:/)) {
      filteredLines.push(line);
      continue;
    }
    
    // 制限セクション内の詳細内容は伏字
    if (inRestrictedSection && line.trim()) {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        // リスト項目の見出しのみ表示
        const listItem = line.substring(0, Math.min(line.length, 20));
        filteredLines.push(`${listItem}... ●●●●●`);
      } else {
        filteredLines.push('●●●●● 詳細を見るには会員登録が必要です ●●●●●');
      }
    } else if (!inRestrictedSection) {
      // 制限外セクションはそのまま表示
      filteredLines.push(line);
    }
  }
  
  return filteredLines.join('\n');
}

/**
 * AuthErrorをフレンドリーなメッセージに変換
 */
export function formatAuthError(error: any): AuthError {
  const message = error?.message || 'エラーが発生しました';
  const code = error?.code || error?.error_code;
  
  // よくあるエラーのメッセージ変換
  const friendlyMessages: Record<string, string> = {
    'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
    'Email not confirmed': 'メールアドレスの認証が完了していません。確認メールをチェックしてください',
    'User already registered': 'このメールアドレスは既に登録されています',
    'Password should be at least 8 characters': 'パスワードは8文字以上で入力してください',
    'Signup requires a valid password': '有効なパスワードを入力してください',
    'Invalid email': '有効なメールアドレスを入力してください',
  };
  
  const friendlyMessage = friendlyMessages[message] || message;
  
  return {
    message: friendlyMessage,
    code,
    details: error?.details,
  };
}