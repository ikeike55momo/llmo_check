/**
 * LLMO詳細診断サイト - Anthropic Claude APIクライアント
 * AI最適化に特化した詳細分析機能を提供
 */

import Anthropic from '@anthropic-ai/sdk';

/** Anthropicクライアントのキャッシュ */
let anthropicClient: Anthropic | null = null;

/**
 * Anthropicクライアントを取得（遅延初期化）
 */
function getAnthropicClient(): Anthropic {
  if (anthropicClient) {
    return anthropicClient;
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY環境変数が設定されていません');
  }

  anthropicClient = new Anthropic({
    apiKey: anthropicApiKey,
  });

  return anthropicClient;
}

/**
 * LLMO詳細診断用の高度なプロンプトテンプレート
 */
const LLMO_DETAILED_DIAGNOSIS_PROMPT = `あなたは「AI最適化診断のスペシャリスト」です。提供されたWebサイトのコンテンツを、AI（ChatGPT、Claude、Gemini、Perplexity等）がどれだけ理解・活用しやすいかという観点から徹底的に分析してください。

重要：可能な限り具体的で詳細な分析を行い、推測可能な技術的要素も含めて診断してください。

# 分析対象のWebサイトコンテンツ:
{content}

# 診断レポート形式

## 🎯 エグゼクティブサマリー
- **総合LLMOスコア**: ★★★★★（5段階評価）
- **AIによる引用可能性**: XX%（推定）
- **最重要改善ポイント**: 3つの具体的な課題

## 📊 詳細診断結果

### 1. コンテンツ構造の階層性分析
#### 1.1 見出し構造の論理性
- **検出された見出しパターン**:
  - H1相当: 「{具体的なテキスト}」×{個数}
  - H2相当: 「{具体的なテキスト}」×{個数}
  - H3相当: 「{具体的なテキスト}」×{個数}
- **階層の一貫性評価**: {詳細な分析}
- **AIの理解しやすさ**: {なぜAIにとって良い/悪いか}
- **具体的な問題箇所**: 
  - 例：「{具体的な見出し}」の後に階層が飛んでいる

#### 1.2 段落とセクションの設計
- **段落の平均文字数**: {推定値}文字
- **最長段落**: 約{推定値}文字（AIには長すぎる/適切）
- **トピックの分離度**: {明確/曖昧}
- **改善提案**: 
  - 「{具体的な長い段落の冒頭}...」を3つに分割
  - 各段落に明確なトピックセンテンスを追加

### 2. セマンティック（意味的）要素の分析
#### 2.1 キーワードと文脈の豊富さ
- **主要トピック**: 「{識別されたメインテーマ}」
- **関連語彙の網羅性**:
  - 使用されている同義語: {リスト}
  - 不足している関連語: {リスト}
- **専門用語の説明**:
  - 適切に説明されている: {例}
  - 説明が不足: 「{用語}」「{用語}」

#### 2.2 エンティティ（実体）の明確性
- **識別された主要エンティティ**:
  - 人物/組織: {リスト}
  - 製品/サービス: {リスト}
  - 概念/技術: {リスト}
- **文脈情報の充実度**: {評価と具体例}

### 3. 情報の構造化レベル
#### 3.1 リストと表形式の活用
- **箇条書きの使用**: {有/無、効果的/非効果的}
- **番号付きリストの適切性**: {手順説明での使用有無}
- **表形式で整理すべき情報**: 
  - 例：「{比較情報}」は表形式が適切

#### 3.2 Q&A・How-to形式の評価
- **質問-回答形式の有無**: {検出結果}
- **手順説明の明確性**: {ステップバイステップか}
- **FAQセクションの提案**: {必要性と内容案}

### 4. メタ情報と信頼性シグナル
#### 4.1 著者情報と専門性
- **著者情報の明示**: {有/無}
- **専門性の根拠**: {資格、経験の記載有無}
- **改善提案**: {具体的な追加すべき情報}

#### 4.2 時間的要素と更新性
- **日付情報**: {公開日/更新日の有無}
- **情報の鮮度**: {時事性のある内容か}
- **推奨**: {更新頻度や日付表示の改善案}

### 5. 技術的最適化の推測
#### 5.1 推測されるHTML構造
- **セマンティックHTMLの使用推定**: {高/中/低}
- **構造化データの可能性**: {おそらく実装/未実装}
- **アクセシビリティ配慮**: {alt属性等の推測}

#### 5.2 AIクローラビリティ
- **動的コンテンツの割合**: {推定}
- **JavaScriptレンダリング依存度**: {推測}
- **インデックス可能性**: {高/中/低}

### 6. ユーザーインテントとの整合性
#### 6.1 検索意図のカバレッジ
- **情報収集型**: {対応度と具体例}
- **問題解決型**: {対応度と具体例}
- **比較検討型**: {対応度と具体例}
- **トランザクション型**: {対応度と具体例}

#### 6.2 コンテンツの網羅性
- **トピックの深さ**: {表面的/詳細}
- **関連トピックのカバー**: {十分/不足}
- **ユーザーの次の質問**: {予測される質問}

## 🔧 優先度別改善提案

### 🔴 最優先（今すぐ実施すべき）
1. **{具体的な改善項目}**
   - 現状: {詳細な問題説明}
   - 改善方法: {ステップバイステップの手順}
   - 期待効果: AI理解度 +{推定}%

2. **{具体的な改善項目}**
   - 現状: {詳細な問題説明}
   - 改善方法: {ステップバイステップの手順}
   - 期待効果: AI理解度 +{推定}%

### 🟡 高優先度（1週間以内に実施）
{3-5個の具体的な改善提案}

### 🟢 中優先度（1ヶ月以内に実施）
{3-5個の具体的な改善提案}

## 📈 改善実施後の期待効果

### 定量的効果（推定）
- **AI理解度スコア**: 現在{X}% → 改善後{Y}%
- **AI検索での表示確率**: {X}倍向上
- **引用される可能性**: {X}%向上

### 定性的効果
- {具体的な質的改善の説明}
- {ユーザー体験の向上}
- {ビジネスインパクト}

## 💡 業界別ベストプラクティス
{検出されたコンテンツタイプに応じた業界標準との比較}

## 🚀 次のステップ
1. {最初に取り組むべき具体的なアクション}
2. {2番目のアクション}
3. {効果測定の方法}

---
注：この診断は提供されたテキストコンテンツのみに基づいています。完全な技術的分析には、実際のHTML構造やメタデータの確認が推奨されます。`;

/**
 * WebサイトコンテンツをLLMO観点で詳細診断
 */
export async function diagnoseWebsiteContent(content: string): Promise<string> {
  try {
    // コンテンツサイズの制限を増やして詳細分析を可能に
    const maxContentLength = 15000; // より多くのコンテンツを分析
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '\n\n[コンテンツが長すぎるため、最初の15,000文字を分析対象としています]'
      : content;

    // プロンプトにコンテンツを埋め込み
    const finalPrompt = LLMO_DETAILED_DIAGNOSIS_PROMPT.replace('{content}', truncatedContent);

    // Claude API呼び出し（詳細分析のため設定を調整）
    const response = await getAnthropicClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000, // 詳細な分析のため増量
      temperature: 0.2, // わずかな創造性を許可しつつ一貫性を保持
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
 * コンテンツの前処理（LLMO分析用に最適化）
 * HTMLタグを保持しつつ、構造を推測可能な形式に変換
 */
export function preprocessContent(rawContent: string): string {
  try {
    // スクリプトとスタイルは除去
    let processedContent = rawContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // 重要なHTMLタグは構造を示すテキストに変換
    processedContent = processedContent
      // 見出しタグを明示的に変換
      .replace(/<h1[^>]*>/gi, '\n[H1見出し] ')
      .replace(/<\/h1>/gi, '\n')
      .replace(/<h2[^>]*>/gi, '\n[H2見出し] ')
      .replace(/<\/h2>/gi, '\n')
      .replace(/<h3[^>]*>/gi, '\n[H3見出し] ')
      .replace(/<\/h3>/gi, '\n')
      .replace(/<h4[^>]*>/gi, '\n[H4見出し] ')
      .replace(/<\/h4>/gi, '\n')
      .replace(/<h5[^>]*>/gi, '\n[H5見出し] ')
      .replace(/<\/h5>/gi, '\n')
      .replace(/<h6[^>]*>/gi, '\n[H6見出し] ')
      .replace(/<\/h6>/gi, '\n')
      
      // リスト構造を保持
      .replace(/<ul[^>]*>/gi, '\n[箇条書きリスト開始]\n')
      .replace(/<\/ul>/gi, '[箇条書きリスト終了]\n')
      .replace(/<ol[^>]*>/gi, '\n[番号付きリスト開始]\n')
      .replace(/<\/ol>/gi, '[番号付きリスト終了]\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      
      // セマンティックタグを明示
      .replace(/<article[^>]*>/gi, '\n[記事セクション開始]\n')
      .replace(/<\/article>/gi, '\n[記事セクション終了]\n')
      .replace(/<section[^>]*>/gi, '\n[セクション開始]\n')
      .replace(/<\/section>/gi, '\n[セクション終了]\n')
      .replace(/<nav[^>]*>/gi, '\n[ナビゲーション]\n')
      .replace(/<\/nav>/gi, '\n')
      .replace(/<header[^>]*>/gi, '\n[ヘッダー開始]\n')
      .replace(/<\/header>/gi, '\n[ヘッダー終了]\n')
      .replace(/<footer[^>]*>/gi, '\n[フッター開始]\n')
      .replace(/<\/footer>/gi, '\n[フッター終了]\n')
      .replace(/<main[^>]*>/gi, '\n[メインコンテンツ開始]\n')
      .replace(/<\/main>/gi, '\n[メインコンテンツ終了]\n')
      .replace(/<aside[^>]*>/gi, '\n[サイドバー開始]\n')
      .replace(/<\/aside>/gi, '\n[サイドバー終了]\n')
      
      // 段落タグ
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      
      // 改行タグ
      .replace(/<br[^>]*>/gi, '\n')
      
      // 強調タグ
      .replace(/<strong[^>]*>/gi, '**')
      .replace(/<\/strong>/gi, '**')
      .replace(/<em[^>]*>/gi, '*')
      .replace(/<\/em>/gi, '*')
      
      // リンクタグ（リンクテキストを保持）
      .replace(/<a[^>]*href="([^"]*)"[^>]*>/gi, '[リンク: ')
      .replace(/<\/a>/gi, ']')
      
      // 画像タグ（alt属性を抽出）
      .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '[画像: $1]')
      .replace(/<img[^>]*>/gi, '[画像: 代替テキストなし]')
      
      // テーブル構造
      .replace(/<table[^>]*>/gi, '\n[表開始]\n')
      .replace(/<\/table>/gi, '\n[表終了]\n')
      .replace(/<tr[^>]*>/gi, '\n[行]')
      .replace(/<\/tr>/gi, '')
      .replace(/<th[^>]*>/gi, ' [見出しセル] ')
      .replace(/<\/th>/gi, ' | ')
      .replace(/<td[^>]*>/gi, ' [セル] ')
      .replace(/<\/td>/gi, ' | ')
      
      // その他のタグを除去
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-zA-Z0-9#]+;/g, ' ')
      
      // 余分な空白を整理
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim();

    // 過度な改行を制限
    processedContent = processedContent
      .replace(/\n{4,}/g, '\n\n\n');

    return processedContent;
  } catch (error) {
    console.error('コンテンツ前処理エラー:', error);
    return rawContent;
  }
}