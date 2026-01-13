# GitHub'a Proje Yükleme Rehberi

## 📋 Adım Adım Talimatlar

### 1. Git Kurulumu (Eğer yüklü değilse)

1. **Git'i indirin:**
   - [Git for Windows](https://git-scm.com/download/win) indirin
   - Kurulum sırasında varsayılan ayarları kullanın

2. **Kurulumu doğrulayın:**
   ```bash
   git --version
   ```

### 2. GitHub'da Repository Oluşturma

1. **GitHub'a gidin:**
   - [GitHub.com](https://github.com) → Giriş yapın

2. **Yeni repository oluşturun:**
   - Sağ üstteki **+** → **New repository**
   - Repository name: `focus-flow` (veya istediğiniz isim)
   - Description: "Study gamification app with virtual garden"
   - **Public** veya **Private** seçin
   - **Initialize with README** seçeneğini işaretlemeyin
   - **Create repository** butonuna tıklayın

### 3. Projeyi GitHub'a Yükleme

#### Yöntem 1: Command Line (Terminal)

**PowerShell veya Command Prompt'u açın ve şu komutları çalıştırın:**

```bash
# 1. Proje klasörüne gidin
cd "C:\Users\berfi\OneDrive\Masaüstü\435_finalproje\studio-main"

# 2. Git repository başlat
git init

# 3. Tüm dosyaları ekle
git add .

# 4. İlk commit yap
git commit -m "Initial commit: Focus Flow study app"

# 5. Main branch oluştur
git branch -M main

# 6. GitHub repository'yi remote olarak ekle
# KULLANICI_ADI ve REPO_ADI yerine kendi bilgilerinizi yazın
git remote add origin https://github.com/bberfingndgn/studio.git
# 7. GitHub'a push et
git push -u origin main
```

**Örnek:**
```bash
git remote add origin https://github.com/berfin/focus-flow.git
git push -u origin main
```

#### Yöntem 2: GitHub Desktop (Kolay Yöntem - Önerilen)

1. **GitHub Desktop'ı indirin:**
   - [GitHub Desktop](https://desktop.github.com/) indirin ve kurun

2. **GitHub Desktop'ta:**
   - **File** → **Add Local Repository**
   - Proje klasörünü seçin: `C:\Users\berfi\OneDrive\Masaüstü\435_finalproje\studio-main`
   - **Publish repository** butonuna tıklayın
   - Repository adını girin
   - **Publish** butonuna tıklayın

### 4. GitHub Authentication

İlk kez push yapıyorsanız kimlik doğrulama gerekir:

**Personal Access Token:**
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Token'a bir isim verin (örn: "Focus Flow Project")
4. **repo** yetkisini seçin
5. **Generate token** butonuna tıklayın
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)
7. Push yaparken şifre yerine bu token'ı kullanın

### 5. Sonraki Değişiklikler için

Projede değişiklik yaptıktan sonra:

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri ekle
git add .

# Commit yap (açıklayıcı mesaj yazın)
git commit -m "Add avatar selection feature"

# GitHub'a push et
git push
```

## 🔒 Güvenlik Kontrol Listesi

✅ `.env.local` dosyası `.gitignore`'da (GitHub'a yüklenmeyecek)
✅ `node_modules` `.gitignore`'da
✅ `.next` build klasörü `.gitignore`'da
✅ Supabase credentials güvende

## 📝 Örnek Commit Mesajları

```bash
git commit -m "Add avatar selection feature to profile page"
git commit -m "Update README with setup instructions"
git commit -m "Fix profile page loading issue"
git commit -m "Add password reset functionality"
git commit -m "Migrate from Firebase to Supabase"
```

## 🆘 Sorun Giderme

### "git: command not found"
- Git'i kurun: [Git for Windows](https://git-scm.com/download/win)

### "fatal: not a git repository"
```bash
git init
```

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
```

### "Authentication failed"
- Personal Access Token kullanın
- GitHub Desktop kullanın (daha kolay)

### "Permission denied"
- GitHub'da repository'ye erişim yetkiniz olduğundan emin olun
- Personal Access Token'ın `repo` yetkisi olduğundan emin olun

## 🔗 Faydalı Linkler

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub Desktop](https://desktop.github.com/)
- [Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## ⚠️ Önemli Notlar

1. **`.env.local` dosyasını ASLA GitHub'a yüklemeyin!**
   - Bu dosya Supabase credentials içerir
   - `.gitignore`'da zaten var, kontrol edin

2. **README.md'yi güncelleyin:**
   - Proje açıklaması
   - Kurulum talimatları
   - Kullanılan teknolojiler

3. **License ekleyin (opsiyonel):**
   - MIT, Apache, vb. bir lisans seçin
