/**
 * LLMO診断サイト - Supabaseクライアント
 * データベース接続とキャッシュ機能を提供
 */

import { createClient } from '@supabase/supabase-js';

/** Supabase設定の検証 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY環境変数が設定されていません');
}

/**
 * Supabaseクライアント（サービスロール）
 * Edge Functionsでのサーバーサイド処理用
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/** 診断キャッシュのデータ構造 */
export interface DiagnosisCacheRow {
  id: string;
  url: string;
  result: string;
  created_at: string;
}

/**
 * 診断結果のキャッシュを取得
 * 24時間以内の結果を検索
 */
export async function getCachedDiagnosis(url: string): Promise<string | null> {
  try {
    // 24時間前の時刻を計算
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('diagnosis_cache')
      .select('result, created_at')
      .eq('url', url)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // レコードが見つからない場合は正常
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('キャッシュ取得エラー:', error);
      return null;
    }

    return data?.result || null;
  } catch (error) {
    console.error('キャッシュ取得例外:', error);
    return null;
  }
}

/**
 * 診断結果をキャッシュに保存
 */
export async function saveDiagnosisCache(url: string, result: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('diagnosis_cache')
      .insert([
        {
          url: url,
          result: result,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('キャッシュ保存エラー:', error);
      // キャッシュ保存失敗は致命的ではないので例外を投げない
    }
  } catch (error) {
    console.error('キャッシュ保存例外:', error);
    // キャッシュ保存失敗は致命的ではないので例外を投げない
  }
}

/**
 * 古いキャッシュエントリを削除（定期的な清掃用）
 * 指定した日数より古いエントリを削除
 */
export async function cleanupOldCache(daysOld: number = 7): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('diagnosis_cache')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('キャッシュクリーンアップエラー:', error);
    }
  } catch (error) {
    console.error('キャッシュクリーンアップ例外:', error);
  }
} 