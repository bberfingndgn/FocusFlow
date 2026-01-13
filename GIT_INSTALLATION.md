# Git Kurulum Rehberi

## 🚀 Git Kurulumu (Windows)

### Yöntem 1: Git for Windows (Önerilen)

1. **Git'i indirin:**
   - [Git for Windows](https://git-scm.com/download/win) sayfasına gidin
   - İndirme otomatik başlayacak

2. **Kurulum:**
   - İndirilen `.exe` dosyasını çalıştırın
   - Kurulum sırasında **varsayılan ayarları** kullanın (Next, Next, Install)
   - Kurulum tamamlandığında **Finish** butonuna tıklayın

3. **Kurulumu doğrulayın:**
   - PowerShell veya Command Prompt'u **YENİDEN AÇIN** (önemli!)
   - Şu komutu çalıştırın:
   ```bash
   git --version
   ```
   - Eğer `git version 2.x.x` gibi bir çıktı görürseniz, kurulum başarılı!

### Yöntem 2: GitHub Desktop (Daha Kolay - Önerilen)

Git kurulumu karmaşık geliyorsa, **GitHub Desktop** kullanabilirsiniz:

1. **GitHub Desktop'ı indirin:**
   - [GitHub Desktop](https://desktop.github.com/) sayfasına gidin
   - **Download for Windows** butonuna tıklayın

2. **Kurulum:**
   - İndirilen `.exe` dosyasını çalıştırın
   - Kurulum talimatlarını takip edin
   - GitHub hesabınızla giriş yapın

3. **Projeyi yükleyin:**
   - GitHub Desktop'ı açın
   - **File** → **Add Local Repository**
   - Proje klasörünü seçin: `C:\Users\berfi\OneDrive\Masaüstü\435_finalproje\studio-main`
   - **Publish repository** butonuna tıklayın
   - Repository adını girin: `studio`
   - **Publish** butonuna tıklayın

## ✅ Git Kurulumu Sonrası

Git kurulumundan sonra, PowerShell'i **YENİDEN AÇIN** ve şu komutları çalıştırın:

```bash
# Proje klasörüne gidin
cd "C:\Users\berfi\OneDrive\Masaüstü\435_finalproje\studio-main"

# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Focus Flow study app"

# Main branch oluştur
git branch -M main

# GitHub repository'yi bağla
git remote add origin https://github.com/bberfingndgn/studio.git

# GitHub'a yükle
git push -u origin main
```

## 🔍 Git Kurulu mu Kontrol Etme

PowerShell'de şu komutu çalıştırın:
```bash
git --version
```

**Eğer hata alırsanız:**
- Git kurulu değil → Yöntem 1 veya 2'yi kullanın
- PowerShell'i yeniden açın
- Tekrar deneyin

## 🆘 Sorun Giderme

### "git: command not found" hatası
- Git kurulu değil → [Git for Windows](https://git-scm.com/download/win) indirin
- PowerShell'i **YENİDEN AÇIN** (önemli!)
- `git --version` ile kontrol edin

### Kurulum sonrası hala çalışmıyor
1. PowerShell'i kapatın ve yeniden açın
2. Sistem PATH'ini kontrol edin:
   - Windows → Settings → System → About → Advanced system settings → Environment Variables
   - `C:\Program Files\Git\cmd` PATH'te olmalı

### Alternatif: GitHub Desktop
- Git kurulumu karmaşık geliyorsa → [GitHub Desktop](https://desktop.github.com/) kullanın
- Daha kolay ve görsel arayüz
- Git otomatik olarak kurulur
