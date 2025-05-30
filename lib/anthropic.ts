/**
 * LLMO診断サイト - Anthropic Claude APIクライアント
 * AI分析機能を提供
 */

import Anthropic from '@anthropic-ai/sdk';

/** Anthropic API設定の検証 */
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY環境変数が設定されていません');
}

/**
 * Anthropic Claudeクライアント
 */
const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

/**
 * Webサイト診断用のプロンプトテンプレート
 */
const DIAGNOSIS_PROMPT = `あなたは経験豊富なWebサイト分析の専門家です。以下のWebサイトのコンテンツを詳細に分析し、総合的な診断レポートを日本語で作成してください。

分析対象のWebサイトコンテンツ:
{content}

以下の観点から分析し、構造化されたレポートを作成してください：

## 1. SEO（検索エンジン最適化）
- タイトルタグとメタディスクリプションの適切性
- 見出し構造（H1, H2, H3等）の最適化
- キーワードの適切な配置
- 内部リンク構造

## 2. コンテンツ品質
- 情報の充実度と有用性
- 読みやすさと構成
- ユーザーのニーズとの合致度
- コンテンツの独自性

## 3. ユーザビリティ
- ナビゲーションの分かりやすさ
- 情報へのアクセスのしやすさ
- モバイル対応の可能性（コンテンツ構造から推測）

## 4. 技術的な観点
- HTMLの構造とセマンティクス
- ページの読み込み速度に影響する要素
- アクセシビリティへの配慮

## 5. 改善提案
- 具体的な改善点
- 優先度の高い課題
- 実装しやすい改善策

各項目について、現状の評価と具体的な改善提案を含めてください。専門的でありながら、理解しやすい言葉で説明してください。`;

/**
 * WebサイトコンテンツをAIで診断
 * Claude Sonnet 4を使用して詳細な分析を実行
 */
export async function diagnoseWebsiteContent(content: string): Promise<string> {
  try {
    // コンテンツサイズの制限（トークン制限を考慮）
    const maxContentLength = 8000; // 約10,000トークン程度に制限
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '\n\n[コンテンツが長すぎるため、一部のみを分析対象としています]'
      : content;

    // プロンプトにコンテンツを埋め込み
    const finalPrompt = DIAGNOSIS_PROMPT.replace('{content}', truncatedContent);

    // Claude API呼び出し
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1, // 一貫性のある分析のため低温度設定
      messages: [
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
    });

    // レスポンスからテキストを抽出
    const analysisText = response.content
      .filter((content) => content.type === 'text')
      .map((content) => content.text)
      .join('\n');

    if (!analysisText.trim()) {
      throw new Error('Claude APIから有効な分析結果を取得できませんでした');
    }

    return analysisText;

  } catch (error) {
    console.error('Claude API呼び出しエラー:', error);
    
    // エラーの種類に応じたメッセージ
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        throw new Error('API利用制限に達しました。しばらく時間をおいてから再試行してください。');
      } else if (error.message.includes('invalid_api_key')) {
        throw new Error('APIキーが無効です。システム管理者にお問い合わせください。');
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error('APIクォータが不足しています。システム管理者にお問い合わせください。');
      }
    }
    
    throw new Error('AI分析中にエラーが発生しました。再試行してください。');
  }
}

/**
 * コンテンツの前処理
 * HTMLタグの除去やテキストの正規化を実行
 */
export function preprocessContent(rawContent: string): string {
  try {
    // HTMLタグを除去
    let cleanContent = rawContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // スクリプトタグを完全除去
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // スタイルタグを完全除去
      .replace(/<[^>]+>/g, ' ') // その他のHTMLタグを空白に置換
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // HTMLエンティティを空白に置換
      .replace(/\s+/g, ' ') // 連続する空白を単一空白に変換
      .trim();

    // 改行やタブを正規化
    cleanContent = cleanContent
      .replace(/[\r\n\t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n'); // 過度な改行を制限

    return cleanContent;
  } catch (error) {
    console.error('コンテンツ前処理エラー:', error);
    return rawContent; // 前処理に失敗した場合は元のコンテンツを返す
  }
} 