# LLMO診断サイト — 実装プランとセキュリティ設計
以下では、要件をもとに次のステップとして

1. アーキテクチャ全体像
2. セキュリティ対策ポイント
3. 実装ステップとコード骨子

をまとめます。

---

## 1. アーキテクチャ全体像

```text
[ユーザー (ブラウザ)]
    │ URL入力 & 送信
    ▼
[Next.js App (App Router + Edge API)]
    │
    ├─■ キャッシュ確認 (Supabase)
    │    └ 有効キャッシュあれば即レスポンス
    │
    ├─■ Webスクレイパー (lib/scraper.ts)
    │    └ fetch → 抽出 → トランケート → （失敗時）ScrapingBee
    │
    ├─■ LLM API 呼び出し (Claude Sonnet 4)
    │
    ├─■ 結果保存 (Supabase `diagnosis_cache`)
    └─■ レスポンス返却

[Supabase (PostgreSQL + RLS)]
    ├─ `diagnosis_cache` テーブル (URL, result, created_at)
    └─ `diagnosis_history` (将来用途)
```

- デプロイ先：Vercel Edge Functions (runtime="edge")
- キャッシングTTL：24時間
- UI言語：日本語限定

---

## 2. セキュリティ対策ポイント

1. **SSRF / URLバリデーション**  
   - ホワイトリスト形式のホスト検証（正規表現やURLクラスで解析）  
   - `http`/`https` のみ許可  
2. **環境変数の安全管理**  
   - APIキーはすべて `process.env` から取得  
   - `vercel env` で本番/プレビュー別に管理
3. **エラー & 例外ハンドリング**  
   - ユーザに返すメッセージには詳細スタックを含めない  
   - Sentry 連携で内部ログ化
4. **Input Validation & Output Encoding**  
   - URLパラメータは URL コンストラクタで検証  
   - HTMLを返す箇所は React のエスケープ機能に委譲
5. **Supabase RLS**  
   - 読み書きともに認証済みサービスロールのみ許可  
   - `created_at` に基づく TTL ロジックはバックエンドで実装
6. **通信の暗号化**  
   - Next.js ⇄ Supabase ⇄ Claude ⇄ ScrapingBee すべて TLS 1.2+  
   - Strict-Transport-Security ヘッダー設定
7. **Edge Function の軽量化**  
   - 大きな依存は避け、標準 Web APIs に集中  
   - 冷スタート抑制のため可能な限り高速パス実装

---

## 3. 実装ステップ & コード骨子

### 3.1 URLバリデーションユーティリティ (`lib/validateUrl.ts`)
```ts
export function validateUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("無効なURL形式です。");
  }
  const allowList = [/^https?:\/\/(.+\.)?example\.com$/]; // 必要に応じ調整
  if (!allowList.some((rx) => rx.test(url.href))) {
    throw new Error("許可されていないホストです。");
  }
  return url;
}
```

### 3.2 スクレイパー (`lib/scraper.ts`)
```ts
import { validateUrl } from './validateUrl';

export async function scrapePage(rawUrl: string): Promise<string> {
  const url = validateUrl(rawUrl);
  // フォールバック用ヘッダー
  const headers = { 'User-Agent': 'LLMO-Diagnose/1.0' };

  try {
    const res = await fetch(url.href, { headers });
    if (!res.ok) throw new Error("フェッチ失敗");
    const html = await res.text();
    return extractText(html);
  } catch {
    return fetchViaScrapingBee(url.href);
  }
}

function extractText(html: string): string {
  // タイトル/メタ/hタグ/本文を正規表現で抜粋し、合計1万字にトランケート
  // (実装省略)
  return truncatedText;
}

async function fetchViaScrapingBee(target: string): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY!;
  const res = await fetch(
    `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(target)}`
  );
  if (!res.ok) throw new Error("ScrapingBee失敗");
  const data = await res.json();
  return extractText(data.html);
}
```

### 3.3 Edge Function (`app/api/diagnose/route.ts`)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapePage } from '@/lib/scraper';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url: string };
    // 1. キャッシュチェック
    const { data, error } = await supabase
      .from('diagnosis_cache')
      .select('result, created_at')
      .eq('url', url)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (error == null && data) {
      return NextResponse.json({ result: data.result, cached: true });
    }

    // 2. スクレイプ → LLM 呼び出し
    const content = await scrapePage(url);
    const diagnosis = await callClaudeAPI(content);

    // 3. キャッシュ保存
    await supabase
      .from('diagnosis_cache')
      .insert({ url, result: diagnosis });

    return NextResponse.json({ result: diagnosis, cached: false });
  } catch (err: any) {
    console.error(err);
    // Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

async function callClaudeAPI(content: string): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY!;
  const res = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4',
      prompt: `以下のウェブコンテンツを診断してください：\n\n${content}`,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error('LLM API エラー');
  const json = await res.json();
  return json.completion;
}
```

### 3.4 Supabase RLS ポリシー例
```sql
-- キャッシュ取得はサービスロールのみ
alter table public.diagnosis_cache
  enable row level security;

create policy "service_role_only_select" on public.diagnosis_cache
  for select using (auth.role() = 'service_role');

create policy "service_role_only_insert" on public.diagnosis_cache
  for insert with check (auth.role() = 'service_role');
```

---

## 次ステップ

1. 上記コードをリポジトリへ追加、動作検証
2. Sentry／Google Analytics のトラッキング埋め込み
3. E2E テスト（無害サイト・クロスドメイン検証）
4. パフォーマンスベンチ（Cold vs Warm レイテンシ）
5. 本番デプロイ & 環境変数設定

以上をもってMVPを完成させ、進捗に合わせて拡張機能（履歴、MFA、レート制限等）へ移行しましょう。