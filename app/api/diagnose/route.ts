/**
 * LLMO診断サイト - 診断API (Edge Function)
 * Webサイト診断のメインAPIエンドポイント
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebpage } from '@/lib/scraper';
import { getServerSupabaseClient, filterDiagnosisForAnonymous } from '@/lib/auth';

/** Edge Runtimeを指定 */
export const runtime = 'edge';

/** APIレスポンスの型定義 */
interface DiagnoseApiResponse {
  result: string;
  cached: boolean;
  isAuthenticated?: boolean;
  hasFullAccess?: boolean;
}

/** APIエラーレスポンスの型定義 */
interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * POST /api/diagnose
 * Webサイト診断のメインエンドポイント
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // リクエストボディの解析
    const body = await request.json().catch(() => null);
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '無効なリクエスト形式です。JSON形式でURLを送信してください。' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    const { url } = body;

    // URLの必須チェック
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URLが指定されていません。' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return NextResponse.json(
        { error: '有効なURLを入力してください。' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    console.log(`診断開始: ${trimmedUrl}`);

    // 認証状態をチェック
    let isAuthenticated = false;
    let userId: string | null = null;
    
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        const supabase = getServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && user) {
          isAuthenticated = true;
          userId = user.id;
          console.log(`認証済みユーザー: ${user.email}`);
        }
      }
    } catch (authError) {
      console.warn('認証チェックエラー（匿名として処理）:', authError);
      // 認証エラーは致命的ではない、匿名ユーザーとして処理継続
    }

    // Step 1: キャッシュ確認（動的import）
    try {
      const { getCachedDiagnosis } = await import('@/lib/supabase');
      const cachedResult = await getCachedDiagnosis(trimmedUrl);
      if (cachedResult) {
        console.log(`キャッシュヒット: ${trimmedUrl}`);
        
        // 認証済みユーザーの場合、診断履歴に保存（キャッシュからでも）
        if (isAuthenticated && userId) {
          try {
            const { saveDiagnosisHistory } = await import('@/lib/auth');
            await saveDiagnosisHistory(userId, trimmedUrl, cachedResult);
            console.log(`キャッシュからの診断履歴保存完了: ${userId}`);
          } catch (historyError) {
            console.warn('キャッシュからの診断履歴保存エラー:', historyError);
          }
        }
        
        // コンテンツフィルタリング適用
        let finalCachedResult = cachedResult;
        if (!isAuthenticated) {
          finalCachedResult = filterDiagnosisForAnonymous(cachedResult);
          console.log(`キャッシュ結果を非認証ユーザー向けにフィルタリング`);
        }
        
        return NextResponse.json({
          result: finalCachedResult,
          cached: true,
          isAuthenticated,
          hasFullAccess: isAuthenticated,
        } as DiagnoseApiResponse);
      }
    } catch (cacheError) {
      console.warn('キャッシュ確認エラー（処理続行）:', cacheError);
      // キャッシュエラーは致命的ではないので処理を続行
    }

    console.log(`キャッシュなし、新規診断開始: ${trimmedUrl}`);

    // Step 2: Webページスクレイピング
    let scrapedContent: string;
    try {
      scrapedContent = await scrapeWebpage(trimmedUrl);
      console.log(`スクレイピング完了: ${scrapedContent.length}文字`);
    } catch (scrapeError) {
      console.error('スクレイピングエラー:', scrapeError);
      return NextResponse.json(
        { 
          error: scrapeError instanceof Error ? scrapeError.message : 'ページの取得に失敗しました',
          code: 'SCRAPE_ERROR'
        } as ApiErrorResponse,
        { status: 422 }
      );
    }

    // Step 3: AI分析実行（動的import）
    let diagnosis: string;
    try {
      const { diagnoseWebsiteContent } = await import('@/lib/anthropic');
      diagnosis = await diagnoseWebsiteContent(scrapedContent);
      console.log(`AI分析完了: ${diagnosis.length}文字`);
    } catch (aiError) {
      console.error('AI分析エラー:', aiError);
      return NextResponse.json(
        { 
          error: aiError instanceof Error ? aiError.message : 'AI分析中にエラーが発生しました',
          code: 'AI_ERROR'
        } as ApiErrorResponse,
        { status: 503 }
      );
    }

    // Step 4: 結果をキャッシュに保存（動的import）
    try {
      const { saveDiagnosisCache } = await import('@/lib/supabase');
      await saveDiagnosisCache(trimmedUrl, diagnosis);
      console.log(`キャッシュ保存完了: ${trimmedUrl}`);
    } catch (cacheError) {
      console.warn('キャッシュ保存エラー（レスポンスは返却）:', cacheError);
      // キャッシュ保存失敗はユーザーには影響しない
    }

    // Step 5: 認証済みユーザーの場合、診断履歴に保存
    if (isAuthenticated && userId) {
      try {
        const { saveDiagnosisHistory } = await import('@/lib/auth');
        await saveDiagnosisHistory(userId, trimmedUrl, diagnosis);
        console.log(`診断履歴保存完了: ${userId}`);
      } catch (historyError) {
        console.warn('診断履歴保存エラー（レスポンスは返却）:', historyError);
        // 履歴保存失敗はユーザーには影響しない
      }
    }

    // Step 6: コンテンツフィルタリングと成功レスポンス
    let finalResult = diagnosis;
    
    // 非認証ユーザーの場合、結果をフィルタリング
    if (!isAuthenticated) {
      finalResult = filterDiagnosisForAnonymous(diagnosis);
      console.log(`非認証ユーザー向けにフィルタリング実行`);
    }

    return NextResponse.json({
      result: finalResult,
      cached: false,
      isAuthenticated,
      hasFullAccess: isAuthenticated,
    } as DiagnoseApiResponse);

  } catch (error) {
    console.error('予期しないAPIエラー:', error);
    
    // サーバー内部エラー
    return NextResponse.json(
      { 
        error: '診断処理中に予期しないエラーが発生しました。しばらく時間をおいて再試行してください。',
        code: 'INTERNAL_ERROR'
      } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/diagnose
 * ヘルスチェック用エンドポイント
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'LLMO診断サイト API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

/**
 * その他のHTTPメソッドに対するエラーレスポンス
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'このメソッドはサポートされていません。POSTメソッドを使用してください。' } as ApiErrorResponse,
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'このメソッドはサポートされていません。POSTメソッドを使用してください。' } as ApiErrorResponse,
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'このメソッドはサポートされていません。POSTメソッドを使用してください。' } as ApiErrorResponse,
    { status: 405 }
  );
} 