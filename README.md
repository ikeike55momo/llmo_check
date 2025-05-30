# LLMO診断サイト

Claude Sonnet 4 AIを活用したWebサイト分析ツール

## 概要

LLMO診断サイトは、任意のWebサイトのURLを入力するだけで、AI（Claude Sonnet 4）による詳細な分析レポートを生成するツールです。SEO、コンテンツ品質、ユーザビリティ、技術的な観点から包括的な診断を提供します。

## 主な機能

- **即座の分析**: URLを入力するだけで数秒〜数十秒で診断結果を取得
- **高精度AI分析**: Claude Sonnet 4による最先端のAI技術で正確な診断
- **スマートキャッシュ**: 24時間以内の結果はキャッシュから高速取得
- **レスポンシブデザイン**: モバイル、タブレット、デスクトップ対応
- **セキュリティ**: HTTPS暗号化、プライベートIP保護、SSRF対策

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**

### バックエンド
- **Vercel Edge Functions**
- **Anthropic Claude Sonnet 4 API**
- **Supabase** (PostgreSQL)

### インフラ
- **Vercel** (ホスティング・デプロイ)

## セットアップ

### 1. 前提条件

- Node.js 20.2.1以上
- npm または yarn
- Git

### 2. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd llmo_check
npm install
```

### 3. 環境変数の設定

`env.example`をコピーして`.env.local`を作成し、必要なAPI キーを設定してください。

```bash
cp env.example .env.local
```

`.env.local`に以下の環境変数を設定：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 4. Supabaseデータベースの設定

以下のSQLコマンドでテーブルを作成してください：

```sql
-- 診断キャッシュテーブル
CREATE TABLE public.diagnosis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_diagnosis_cache_url_created ON public.diagnosis_cache(url, created_at DESC);

-- Row Level Security有効化
ALTER TABLE public.diagnosis_cache ENABLE ROW LEVEL SECURITY;

-- サービスロール用ポリシー
CREATE POLICY "service_role_full_access" ON public.diagnosis_cache
FOR ALL
USING (auth.role() = 'service_role');
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 本番デプロイ

### Vercelでのデプロイ

1. [Vercel](https://vercel.com)にアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定（Vercel Dashboard > Settings > Environment Variables）
4. デプロイを実行

### 必要なAPIキー取得

1. **Supabase**: [supabase.com](https://supabase.com)でプロジェクト作成
2. **Anthropic**: [console.anthropic.com](https://console.anthropic.com)でAPIキー取得

## プロジェクト構成

```
llmo_check/
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── diagnose/
│   │       └── route.ts    # 診断API (Edge Function)
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # レイアウト
│   └── page.tsx            # メインページ
├── components/             # Reactコンポーネント
│   ├── DiagnoseForm.tsx    # 診断フォーム
│   └── ResultDisplay.tsx   # 結果表示
├── lib/                    # ユーティリティライブラリ
│   ├── anthropic.ts        # Claude API
│   ├── scraper.ts          # Webスクレイピング
│   └── supabase.ts         # Supabaseクライアント
├── types/                  # TypeScript型定義
│   └── diagnosis.ts        # 診断関連の型
├── .env.local             # 環境変数（ローカル）
├── next.config.mjs        # Next.js設定
├── tailwind.config.ts     # Tailwind CSS設定
├── tsconfig.json          # TypeScript設定
└── vercel.json            # Vercel設定
```

## APIエンドポイント

### POST /api/diagnose

WebサイトのURL診断を実行します。

#### リクエスト

```json
{
  "url": "https://example.com"
}
```

#### レスポンス

```json
{
  "result": "AI分析結果のテキスト",
  "cached": false
}
```

### GET /api/diagnose

ヘルスチェック用エンドポイントです。

## セキュリティ

- プライベートIPアドレスへのアクセス防止
- SSRF（Server-Side Request Forgery）攻撃対策
- Row Level Security (RLS) によるデータベース保護
- HTTPS通信の強制
- セキュリティヘッダーの設定

## ライセンス

MIT License

## 貢献

Issues やPull Requestsを歓迎します。

## サポート

技術的なサポートが必要な場合は、Issuesで質問してください。
