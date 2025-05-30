/**
 * LLMO診断サイト - 診断API (Edge Function)
 * Webサイト診断のメインAPIエンドポイント
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedDiagnosis, saveDiagnosisCache } from '@/lib/supabase';
import { diagnoseWebsiteContent } from '@/lib/anthropic';
import { scrapeWebpage } from '@/lib/scraper';

/** Edge Runtimeを指定 */
export const runtime = 'edge';

/** APIレスポンスの型定義 */
interface DiagnoseApiResponse {
  result: string;
  cached: boolean;
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

    // Step 1: キャッシュ確認
    try {
      const cachedResult = await getCachedDiagnosis(trimmedUrl);
      if (cachedResult) {
        console.log(`キャッシュヒット: ${trimmedUrl}`);
        return NextResponse.json({
          result: cachedResult,
          cached: true,
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

    // Step 3: AI分析実行
    let diagnosis: string;
    try {
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

    // Step 4: 結果をキャッシュに保存
    try {
      await saveDiagnosisCache(trimmedUrl, diagnosis);
      console.log(`キャッシュ保存完了: ${trimmedUrl}`);
    } catch (cacheError) {
      console.warn('キャッシュ保存エラー（レスポンスは返却）:', cacheError);
      // キャッシュ保存失敗はユーザーには影響しない
    }

    // Step 5: 成功レスポンス
    return NextResponse.json({
      result: diagnosis,
      cached: false,
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