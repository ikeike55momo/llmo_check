/**
 * LLMO診断サイト - Webコンテンツスクレイパー
 * URLからHTMLコンテンツを取得し、分析用に前処理
 */

/** URL検証の正規表現パターン */
const URL_VALIDATION_PATTERN = /^https?:\/\/([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

/** プライベートIPアドレスを除外する正規表現 */
const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

/**
 * URLのセキュリティ検証
 * SSRF攻撃やプライベートIPアドレスへのアクセスを防止
 */
export function validateUrl(url: string): URL {
  let parsedUrl: URL;
  
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('無効なURL形式です。正しいURLを入力してください。');
  }

  // プロトコルの検証
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('HTTPまたはHTTPSプロトコルのURLのみサポートしています。');
  }

  // 基本的なURL形式の検証
  if (!URL_VALIDATION_PATTERN.test(url)) {
    throw new Error('有効なドメイン名のURLを入力してください。');
  }

  // プライベートIPアドレスのチェック
  const hostname = parsedUrl.hostname;
  if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname))) {
    throw new Error('プライベートIPアドレスへのアクセスは許可されていません。');
  }

  // localhostのチェック
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('localhostへのアクセスは許可されていません。');
  }

  return parsedUrl;
}

/**
 * HTMLコンテンツからメタデータを抽出
 */
function extractMetadata(html: string): {
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
} {
  try {
    // タイトルの抽出
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // メタディスクリプションの抽出
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']*)["\'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // 見出しの抽出（H1-H6）
    const headingMatches = html.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi) || [];
    const headings = headingMatches
      .map(heading => heading.replace(/<[^>]+>/g, '').trim())
      .filter(text => text.length > 0);

    // ボディテキストの抽出（スクリプトとスタイルを除外）
    let bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // スクリプト除去
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // スタイル除去
      .replace(/<[^>]+>/g, ' ') // HTMLタグを空白に置換
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // HTMLエンティティを空白に置換
      .replace(/\s+/g, ' ') // 連続する空白を単一空白に変換
      .trim();

    return {
      title,
      description,
      headings,
      bodyText,
    };
  } catch (error) {
    console.error('メタデータ抽出エラー:', error);
    return {
      title: '',
      description: '',
      headings: [],
      bodyText: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    };
  }
}

/**
 * Webページのコンテンツを取得し、分析用に前処理
 */
export async function scrapeWebpage(url: string): Promise<string> {
  // URL検証
  const validatedUrl = validateUrl(url);
  const finalUrl = validatedUrl.toString();

  // HTTPリクエストヘッダー設定
  const headers = {
    'User-Agent': 'LLMO-Checker/1.0 (Website Analysis Bot)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
  };

  let html: string;

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(20000), // 20秒タイムアウト
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status} ${response.statusText}。このサイトはアクセスできません。`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`HTMLでないコンテンツタイプです: ${contentType}。HTMLページのURLを入力してください。`);
    }

    html = await response.text();
    
    if (!html || html.length < 100) {
      throw new Error('取得したコンテンツが短すぎます。有効なHTMLページではない可能性があります。');
    }

  } catch (error) {
    console.error('Webページ取得エラー:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw new Error('ページの読み込みがタイムアウトしました。サイトの応答が遅いか、アクセスできない可能性があります。');
      } else if (error.message.includes('fetch')) {
        throw new Error('ネットワークエラーが発生しました。URLが正しいか、サイトがアクセス可能か確認してください。');
      }
      throw error;
    }
    
    throw new Error('ページの取得に失敗しました。URLを確認してください。');
  }

  // メタデータとコンテンツの抽出
  const { title, description, headings, bodyText } = extractMetadata(html);

  // 分析用コンテンツの構築
  const analysisContent = [
    title ? `タイトル: ${title}` : '',
    description ? `説明: ${description}` : '',
    headings.length > 0 ? `見出し: ${headings.join(', ')}` : '',
    bodyText ? `本文: ${bodyText}` : '',
  ].filter(Boolean).join('\n\n');

  // コンテンツサイズの制限（約10,000文字）
  const maxLength = 10000;
  if (analysisContent.length > maxLength) {
    return analysisContent.substring(0, maxLength) + '\n\n[コンテンツが長すぎるため、一部のみを抽出しています]';
  }

  if (!analysisContent.trim()) {
    throw new Error('ページからコンテンツを抽出できませんでした。JavaScriptで生成されるコンテンツの可能性があります。');
  }

  return analysisContent;
} 