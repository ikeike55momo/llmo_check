-- LLMO診断サイト - 会員登録機能データベーススキーマ
-- Migration: 001_create_membership_tables.sql
-- Created: 2025-06-03
-- Description: ユーザープロフィールと診断履歴テーブルの作成

-- =============================================================================
-- ユーザープロフィールテーブル
-- =============================================================================
-- Supabase auth.users と連携するプロフィール情報
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- =============================================================================
-- 診断履歴テーブル
-- =============================================================================
-- 会員ユーザーの診断履歴を保存
CREATE TABLE IF NOT EXISTS public.diagnosis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  diagnosis_result TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_user_id 
ON public.diagnosis_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_url 
ON public.diagnosis_history(url);

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_favorites 
ON public.diagnosis_history(user_id, is_favorite, created_at DESC) 
WHERE is_favorite = TRUE;

-- =============================================================================
-- Row Level Security (RLS) 設定
-- =============================================================================

-- user_profiles テーブルのRLS有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- user_profiles のポリシー設定
-- ユーザーは自分のプロフィールのみ閲覧・更新可能
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- diagnosis_history テーブルのRLS有効化
ALTER TABLE public.diagnosis_history ENABLE ROW LEVEL SECURITY;

-- diagnosis_history のポリシー設定
-- ユーザーは自分の診断履歴のみアクセス可能
CREATE POLICY "Users can view own diagnosis history" ON public.diagnosis_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis history" ON public.diagnosis_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnosis history" ON public.diagnosis_history
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnosis history" ON public.diagnosis_history
FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- トリガー関数
-- =============================================================================

-- updated_at 自動更新トリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_profiles の updated_at 自動更新トリガー
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 初期データ・設定
-- =============================================================================

-- Service Role用のポリシー（管理機能用）
CREATE POLICY "Service role full access user_profiles" ON public.user_profiles
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access diagnosis_history" ON public.diagnosis_history
FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 統計・分析用ビュー
-- =============================================================================

-- ユーザー統計ビュー（管理者向け）
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30_days,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7_days,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as users_last_24_hours
FROM public.user_profiles;

-- 診断統計ビュー（管理者向け）
CREATE OR REPLACE VIEW public.diagnosis_stats AS
SELECT 
  COUNT(*) as total_diagnoses,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) as total_favorites,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as diagnoses_last_30_days,
  AVG(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1.0 END) as avg_diagnoses_per_user_30_days
FROM public.diagnosis_history;

-- =============================================================================
-- コメント追加
-- =============================================================================

COMMENT ON TABLE public.user_profiles IS 'ユーザープロフィール情報。Supabase auth.users と1:1関係';
COMMENT ON COLUMN public.user_profiles.id IS 'Supabase auth.users.id と同期するUUID';
COMMENT ON COLUMN public.user_profiles.email IS 'ユーザーのメールアドレス（ログインID）';
COMMENT ON COLUMN public.user_profiles.display_name IS 'ユーザーの表示名（オプション）';

COMMENT ON TABLE public.diagnosis_history IS '会員ユーザーの診断履歴保存テーブル';
COMMENT ON COLUMN public.diagnosis_history.user_id IS 'user_profiles.id への外部キー';
COMMENT ON COLUMN public.diagnosis_history.url IS '診断対象のURL';
COMMENT ON COLUMN public.diagnosis_history.diagnosis_result IS 'Claude分析結果の完全版テキスト';
COMMENT ON COLUMN public.diagnosis_history.is_favorite IS 'お気に入り登録フラグ';

-- =============================================================================
-- 権限設定
-- =============================================================================

-- 認証済みユーザーに適切な権限を付与
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_history TO authenticated;

-- 匿名ユーザーには読み取り専用で必要最小限の権限
GRANT USAGE ON SCHEMA public TO anon;

-- Service Role には全権限
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;