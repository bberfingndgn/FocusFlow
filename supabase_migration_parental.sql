-- ============================================================
-- FocusFlow - Ebeveyn Kilidi Migration
-- Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================================

-- Users tablosuna yeni sütunlar ekle
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS date_of_birth    date,
  ADD COLUMN IF NOT EXISTS parent_email     text,       -- ebeveynin e-posta adresi
  ADD COLUMN IF NOT EXISTS otp_code         text,       -- tek kullanımlık doğrulama kodu
  ADD COLUMN IF NOT EXISTS otp_expires_at   timestamptz; -- kodun geçerlilik süresi

-- study_sessions tablosuna doğrulama bayrağı ekle
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- 15 yaş üstü mevcut oturumları otomatik doğrulanmış say
-- (bu satırı çalıştırmadan önce mevcut kullanıcıların date_of_birth değeri olmadığından
--  hepsini verified say — yeni kullanıcılar signup'ta doğru değeri alacak)
UPDATE public.study_sessions SET is_verified = true WHERE is_verified = false;
