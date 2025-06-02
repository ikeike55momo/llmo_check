# CLAUDE.md - LLMO診断サイト開発ガイド

## 🎯 プロジェクト概要

LLMO診断サイトは、Claude Sonnet 4 AIを活用した革新的なWebサイト分析ツールです。従来のSEOツールでは実現できない「AI視点での最適化診断」を提供し、現代のAI検索エンジン（ChatGPT、Claude、Gemini、Perplexity等）に最適化されたコンテンツ作成を支援します。

### 🔍 核心価値提案
- **LLMO（Large Language Model Optimization）**: AI検索エンジンでの上位表示・引用確率向上
- **Claude Sonnet 4による高精度分析**: 人間が見落としがちなセマンティック要素の詳細診断
- **即座の無料診断**: URLを入力するだけで数秒〜数十秒でプロフェッショナルレベルの分析結果
- **24時間スマートキャッシュ**: 高速レスポンスと効率的なリソース利用

## 🏗️ アーキテクチャ概要

### テクニカルスタック
```
Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS
Backend: Vercel Edge Functions
AI Engine: Claude Sonnet 4 (Anthropic API)
Database: Supabase (PostgreSQL)
Hosting: Vercel
```

### 主要コンポーネント構成
```
llmo_check/
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── diagnose/       # 診断API (Edge Function)
│   ├── layout.tsx          # SEO最適化済みレイアウト
│   └── page.tsx            # LLMO最適化済みメインページ
├── components/             # Reactコンポーネント
│   ├── DiagnoseForm.tsx    # URL入力・バリデーション
│   └── ResultDisplay.tsx   # AI診断結果表示
├── lib/                    # コアライブラリ
│   ├── anthropic.ts        # Claude API統合
│   ├── scraper.ts          # Webスクレイピング
│   └── supabase.ts         # データベース操作
└── types/                  # TypeScript型定義
    └── diagnosis.ts        # 診断関連型
```

## 🤖 AI分析エンジンの仕組み

### Claude Sonnet 4統合の特徴
1. **高度なプロンプトエンジニアリング**: 15,000文字の詳細分析プロンプトでLLMO観点から包括的診断
2. **セマンティック要素分析**: 見出し構造、段落設計、キーワード文脈、エンティティ明確性を詳細評価
3. **構造化レポート生成**: エグゼクティブサマリー、詳細診断、優先度別改善提案を体系的に提供
4. **技術推測機能**: HTMLタグからセマンティック構造、アクセシビリティ、クローラビリティを推測

### 分析プロセス
```
1. URL受信 → 2. キャッシュ確認 → 3. Webスクレイピング → 4. コンテンツ前処理 → 5. Claude分析 → 6. 結果キャッシュ → 7. レポート返却
```

## 📊 データベース設計

### Supabaseテーブル構造
```sql
-- 診断結果キャッシュテーブル
CREATE TABLE public.diagnosis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  result TEXT NOT NULL,           -- Claude分析結果（JSON/Markdown）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- パフォーマンス最適化インデックス
CREATE INDEX idx_diagnosis_cache_url_created ON public.diagnosis_cache(url, created_at DESC);

-- セキュリティ設定
ALTER TABLE public.diagnosis_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON public.diagnosis_cache
FOR ALL USING (auth.role() = 'service_role');
```

### キャッシュ戦略
- **有効期限**: 24時間（AI分析の一貫性とコスト効率のバランス）
- **キーイング**: URLベース（正規化済み）
- **容量管理**: 自動期限切れ削除

## 🔧 開発ワークフロー

### 環境セットアップ
```bash
# 1. リポジトリクローン
git clone [repository-url]
cd llmo_check

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp env.example .env.local
# 以下を設定:
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_KEY=your-supabase-service-role-key
# ANTHROPIC_API_KEY=your-anthropic-api-key

# 4. 開発サーバー起動
npm run dev
```

### 品質保証プロセス
```bash
# TypeScript型チェック
npm run build

# ESLint静的解析
npm run lint

# Vercel本番デプロイ
vercel --prod
```

## 🚀 パフォーマンス最適化

### フロントエンド最適化
1. **モバイル優先設計**: タッチターゲット44px+、フォントサイズ16px+でiOSズーム防止
2. **レスポンシブブレイクポイント**: `sm:`, `md:`, `lg:`で段階的UI調整
3. **画像最適化**: Next.js Image、WebP対応、適切なalt属性
4. **フォント最適化**: `display: swap`でレンダリングブロック回避

### バックエンド最適化
1. **Edge Functions**: 世界中のエッジロケーションで低レイテンシー実現
2. **スマートキャッシュ**: 24時間TTLで分析コスト削減
3. **エラーハンドリング**: レート制限、API障害への適切な対応
4. **セキュリティヘッダー**: HTTPS強制、XSS防御、CSRF対策

## 🎨 UI/UXデザイン哲学

### ユーザビリティ原則
1. **シンプルさ**: URLを入力するだけの直感的インターフェース
2. **視覚的フィードバック**: ローディング状態、成功・エラー表示の明確化
3. **アクセシビリティ**: スクリーンリーダー対応、キーボードナビゲーション
4. **モバイルファースト**: タッチデバイスでの操作性最優先

### カラーパレット
```css
--color-primary: #2563eb    /* メインブランドカラー */
--color-secondary: #059669  /* サブカラー */
--color-accent: #dc2626     /* エラー・警告 */
--color-neutral-light: #f9fafb
--color-neutral-dark: #111827
```

## 🔒 セキュリティ仕様

### データ保護
- **プライバシー**: 個人情報収集なし、匿名診断実行
- **通信暗号化**: 全てHTTPS、セキュリティヘッダー設定済み
- **SSRF対策**: プライベートIPアドレスへのアクセス防止
- **RLS**: Supabaseでの行レベルセキュリティ有効化

### API セキュリティ
- **認証**: Anthropic API、Supabase Service Role認証
- **レート制限**: 過度なリクエスト防止機構
- **エラー処理**: センシティブ情報の漏洩防止

## 📈 SEO・LLMO最適化戦略

### 技術的SEO
1. **メタデータ最適化**: title、description、OG tags、Twitter Cards
2. **構造化データ**: JSON-LD schema.orgマークアップ
3. **サイトマップ**: 自動生成、検索エンジン向け最適化
4. **ページ速度**: Core Web Vitals最適化

### LLMO最適化
1. **セマンティック構造**: 適切なHTMLタグ、見出し階層
2. **コンテンツ品質**: 詳細な説明、FAQ、使い方ガイド
3. **キーワード最適化**: AI検索で重要なロングテールキーワード
4. **引用可能性**: 明確な情報ソース、権威性の確立

## 🧪 テスト戦略

### 自動テスト範囲
```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# パフォーマンステスト
npm run test:performance
```

### 手動テスト項目
1. **機能テスト**: URL入力→診断→結果表示の完全フロー
2. **互換性テスト**: Chrome、Safari、Firefox、モバイルブラウザ
3. **負荷テスト**: 同時アクセス、大量URL処理
4. **ユーザビリティテスト**: 実際のユーザーによる操作性評価

## 🔄 継続的改善プロセス

### 定期メンテナンス
- **依存関係更新**: 月次セキュリティパッチ適用
- **API制限監視**: Anthropic、Supabase使用量トラッキング
- **パフォーマンス監視**: Core Web Vitals、エラー率
- **ユーザーフィードバック**: 機能改善・バグ報告対応

### 機能拡張計画
1. **多言語対応**: 英語、中国語版の追加
2. **高度な分析**: 競合比較、時系列変化追跡
3. **エクスポート機能**: PDF、CSV形式での結果出力
4. **API提供**: 外部ツールとの連携機能

## 💡 トラブルシューティング

### よくある問題と解決法

#### Claude API エラー
```typescript
// レート制限対応
if (error.message.includes('rate_limit')) {
  throw new Error('API利用制限に達しました。しばらく時間をおいてから再試行してください。');
}
```

#### スクレイピング失敗
```typescript
// タイムアウト・SSL証明書エラー対応
try {
  const response = await fetch(url, { timeout: 10000 });
} catch (error) {
  throw new Error('ページの取得に失敗しました。URLを確認してください。');
}
```

#### データベース接続エラー
```typescript
// Supabase接続タイムアウト対応
const supabase = createClient(url, key, {
  global: { fetch: fetch },
  auth: { persistSession: false }
});
```

## 📞 サポート・コントリビューション

### 開発者向けリソース
- **ドキュメント**: README.md、API仕様書
- **Issue追跡**: GitHub Issues
- **コミュニティ**: 開発者Slack、技術ブログ
- **ロードマップ**: 機能追加・改善計画

### コントリビューションガイドライン
1. **Issue作成**: バグ報告、機能要望は詳細な情報を記載
2. **Pull Request**: 機能ブランチからの小さな変更を推奨
3. **コーディング規約**: ESLint、Prettier設定に準拠
4. **テスト要件**: 新機能には対応するテストコードを追加

---

**最終更新**: 2024年12月
**バージョン**: v1.0.0
**メンテナンス担当**: LLMO診断サイト運営チーム