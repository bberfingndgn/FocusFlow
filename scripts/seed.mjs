import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Eksik env değişkeni!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL   :', SUPABASE_URL ? '✓' : 'YOK');
  console.error('   SUPABASE_SERVICE_ROLE_KEY  :', SERVICE_ROLE_KEY ? '✓' : 'YOK');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// SECONDS_TO_GROW_FLOWER = 14400 sn = 240 dk
//
// Her kullanıcı için çiçek eşikleri (kümülatif dakika):
//   1. çiçek →  240 dk
//   2. çiçek →  480 dk
//   3. çiçek →  720 dk  ... vs.
//
// Seanslar tüm zaman dilimleri boyunca yayıldı:
//   - 3 ay öncesinden bu haftaya kadar her ~4 günde bir seans
//   - Geçen haftada 2 seans, bu hafta (bugün dahil) 2-4 seans
//   - Bugünün seansları garden "Day" görünümünde çiçek üretir
//
// Berfin  → 24 seans × 75 dk = 1800 dk = 30 saat → 7 çiçek
//            Çiçek zamanları: ay3(×4), ay2(×1), geçen hafta(×1), bugün(×1)
//
// Elif    → 16 seans × 75 dk = 1200 dk = 20 saat → 5 çiçek
//            Çiçek zamanları: ay3(×1), ay2(×2), geçen hafta(×1), bugün(×1)
//
// Sena    → 12 seans × 60 dk =  720 dk = 12 saat → 3 çiçek
//            Çiçek zamanları: ay2(×1), ay1(×1), bugün(×1)
//
// Öykü   →  5 seans (3×60 + 2×90) = 360 dk =  6 saat → 1 çiçek
//            Çiçek zamanları: bugün(×1)
// ─────────────────────────────────────────────────────────────────────────────

const USERS = [
  {
    email: 'berfin@focusflow.app',
    password: 'Test1234!',
    username: 'Berfin Gündoğan',
    date_of_birth: '2003-07-12',
    //
    // Kümülatif izleme (her 75 dk = 4500 sn):
    //  seans 1-3  → 225 dk      → 0 çiçek
    //  seans 4    → 300 dk      → Çiçek 1 (eşik 240 dk, daysAgo 76)   ← ay3
    //  seans 7    → 525 dk      → Çiçek 2 (eşik 480 dk, daysAgo 64)   ← ay3
    //  seans 10   → 750 dk      → Çiçek 3 (eşik 720 dk, daysAgo 52)   ← ay2 (yakın)
    //  seans 13   → 975 dk      → Çiçek 4 (eşik 960 dk, daysAgo 40)   ← ay2
    //  seans 16   → 1200 dk     → Çiçek 5 (eşik 1200 dk, daysAgo 28)  ← ay1
    //  seans 20   → 1500 dk     → Çiçek 6 (eşik 1440 dk, daysAgo 6)   ← GEÇEN HAFTA
    //  seans 23   → 1725 dk     → Çiçek 7 (eşik 1680 dk, daysAgo 0)   ← BUGÜN
    //
    sessions: [
      // ── Ay 3 (88-44 gün önce) — her ~4 günde bir ───────────────────────
      { subject: 'Mathematics',    daysAgo: 88, hour:  9, duration: 75 },
      { subject: 'Science',        daysAgo: 84, hour: 14, duration: 75 },
      { subject: 'English',        daysAgo: 80, hour: 20, duration: 75 },
      { subject: 'Social Studies', daysAgo: 76, hour:  9, duration: 75 }, // ← Çiçek 1
      { subject: 'Mathematics',    daysAgo: 72, hour: 15, duration: 75 },
      { subject: 'Science',        daysAgo: 68, hour:  8, duration: 75 },
      { subject: 'English',        daysAgo: 64, hour: 19, duration: 75 }, // ← Çiçek 2
      { subject: 'Social Studies', daysAgo: 60, hour: 10, duration: 75 },
      { subject: 'Mathematics',    daysAgo: 56, hour: 14, duration: 75 },
      { subject: 'Science',        daysAgo: 52, hour: 20, duration: 75 }, // ← Çiçek 3
      { subject: 'English',        daysAgo: 48, hour:  9, duration: 75 },
      { subject: 'Social Studies', daysAgo: 44, hour: 15, duration: 75 },
      // ── Ay 2 (43-20 gün önce) ───────────────────────────────────────────
      { subject: 'Mathematics',    daysAgo: 40, hour:  8, duration: 75 }, // ← Çiçek 4
      { subject: 'Science',        daysAgo: 36, hour: 19, duration: 75 },
      { subject: 'English',        daysAgo: 32, hour: 10, duration: 75 },
      { subject: 'Social Studies', daysAgo: 28, hour: 14, duration: 75 }, // ← Çiçek 5
      { subject: 'Mathematics',    daysAgo: 24, hour: 20, duration: 75 },
      { subject: 'Science',        daysAgo: 20, hour:  9, duration: 75 },
      // ── Geçen hafta (9 ve 6 gün önce) ──────────────────────────────────
      { subject: 'English',        daysAgo:  9, hour: 15, duration: 75 },
      { subject: 'Social Studies', daysAgo:  6, hour: 10, duration: 75 }, // ← Çiçek 6
      // ── Bu hafta (2 gün önce = Pazartesi) ───────────────────────────────
      { subject: 'Mathematics',    daysAgo:  2, hour: 14, duration: 75 },
      // ── BUGÜN (3 seans = 225 dk, Çiçek 7 Science seansında açılıyor) ───
      { subject: 'Mathematics',    daysAgo:  0, hour:  9, duration: 75 },
      { subject: 'Science',        daysAgo:  0, hour: 14, duration: 75 }, // ← Çiçek 7
      { subject: 'English',        daysAgo:  0, hour: 19, duration: 75 },
    ],
  },

  {
    email: 'elif@focusflow.app',
    password: 'Test1234!',
    username: 'Elif Çınar',
    date_of_birth: '2004-03-22',
    //
    // Kümülatif (16 × 75 dk):
    //  seans 4  → 300 dk → Çiçek 1 (eşik 240, daysAgo 66)  ← ay3
    //  seans 7  → 525 dk → Çiçek 2 (eşik 480, daysAgo 48)  ← ay2
    //  seans 10 → 750 dk → Çiçek 3 (eşik 720, daysAgo 30)  ← ay1
    //  seans 13 → 975 dk → Çiçek 4 (eşik 960, daysAgo 9)   ← GEÇEN HAFTA
    //  seans 16 → 1200 dk→ Çiçek 5 (eşik 1200, daysAgo 0)  ← BUGÜN
    //
    sessions: [
      { subject: 'Social Studies', daysAgo: 84, hour: 15, duration: 75 },
      { subject: 'English',        daysAgo: 78, hour:  9, duration: 75 },
      { subject: 'Mathematics',    daysAgo: 72, hour: 19, duration: 75 },
      { subject: 'Social Studies', daysAgo: 66, hour: 14, duration: 75 }, // ← Çiçek 1
      { subject: 'English',        daysAgo: 60, hour: 10, duration: 75 },
      { subject: 'Mathematics',    daysAgo: 54, hour: 20, duration: 75 },
      { subject: 'Social Studies', daysAgo: 48, hour:  9, duration: 75 }, // ← Çiçek 2
      { subject: 'English',        daysAgo: 42, hour: 15, duration: 75 },
      { subject: 'Mathematics',    daysAgo: 36, hour:  8, duration: 75 },
      { subject: 'Social Studies', daysAgo: 30, hour: 19, duration: 75 }, // ← Çiçek 3
      { subject: 'English',        daysAgo: 24, hour: 10, duration: 75 },
      { subject: 'Mathematics',    daysAgo: 20, hour: 14, duration: 75 },
      // ── Geçen hafta ─────────────────────────────────────────────────────
      { subject: 'Social Studies', daysAgo:  9, hour: 20, duration: 75 }, // ← Çiçek 4
      { subject: 'English',        daysAgo:  6, hour:  9, duration: 75 },
      // ── Bu hafta ────────────────────────────────────────────────────────
      { subject: 'Mathematics',    daysAgo:  2, hour: 15, duration: 75 },
      // ── BUGÜN ───────────────────────────────────────────────────────────
      { subject: 'Social Studies', daysAgo:  0, hour: 10, duration: 75 }, // ← Çiçek 5
    ],
  },

  {
    email: 'sena@focusflow.app',
    password: 'Test1234!',
    username: 'Güngör Sena Bal',
    date_of_birth: '2003-11-05',
    //
    // 12 × 60 dk = 720 dk = 12 saat
    // Çiçek 1 → eşik 240 dk → seans 4 (daysAgo 47)   ← ay2
    // Çiçek 2 → eşik 480 dk → seans 8 (daysAgo 13)   ← bu ay
    // Çiçek 3 → eşik 720 dk → seans 12 (daysAgo 0)   ← BUGÜN
    //
    sessions: [
      { subject: 'Mathematics',    daysAgo: 80, hour: 10, duration: 60 },
      { subject: 'Science',        daysAgo: 69, hour: 14, duration: 60 },
      { subject: 'Social Studies', daysAgo: 58, hour: 20, duration: 60 },
      { subject: 'English',        daysAgo: 47, hour:  9, duration: 60 }, // ← Çiçek 1
      { subject: 'Mathematics',    daysAgo: 37, hour: 15, duration: 60 },
      { subject: 'Science',        daysAgo: 27, hour:  8, duration: 60 },
      { subject: 'Social Studies', daysAgo: 20, hour: 19, duration: 60 },
      { subject: 'English',        daysAgo: 13, hour: 10, duration: 60 }, // ← Çiçek 2
      // ── Geçen hafta ─────────────────────────────────────────────────────
      { subject: 'Mathematics',    daysAgo:  9, hour: 14, duration: 60 },
      { subject: 'Science',        daysAgo:  6, hour: 20, duration: 60 },
      // ── Bu hafta ────────────────────────────────────────────────────────
      { subject: 'Social Studies', daysAgo:  2, hour:  9, duration: 60 },
      // ── BUGÜN ───────────────────────────────────────────────────────────
      { subject: 'English',        daysAgo:  0, hour: 14, duration: 60 }, // ← Çiçek 3
    ],
  },

  {
    email: 'oyku@focusflow.app',
    password: 'Test1234!',
    username: 'Öykü Özoğuz',
    date_of_birth: '2004-08-30',
    //
    // 3×60 (geçmiş) + 2×90 (bugün) = 360 dk = 6 saat → 1 çiçek
    // Geçmiş: 180 dk = 10800 sn → 0 çiçek
    // Bugün Science (90 dk): 270 dk = 16200 sn → Çiçek 1 at 240 dk (60 dk içinde) ✓
    //
    sessions: [
      { subject: 'Science',     daysAgo: 62, hour: 14, duration: 60 },
      { subject: 'Mathematics', daysAgo: 42, hour:  9, duration: 60 },
      { subject: 'Science',     daysAgo: 24, hour: 15, duration: 60 },
      // ── BUGÜN ───────────────────────────────────────────────────────────
      { subject: 'Science',     daysAgo:  0, hour:  9, duration: 90 }, // ← Çiçek 1 (60dk içinde)
      { subject: 'Mathematics', daysAgo:  0, hour: 15, duration: 90 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

function buildTimes(daysAgo, hour, durationMinutes) {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start_time: start.toISOString(), end_time: end.toISOString() };
}

async function seedUser(userDef) {
  const { email, password, username, date_of_birth, sessions } = userDef;

  // Varsa eski hesabı sil
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) {
    await admin.auth.admin.deleteUser(found.id);
    console.log(`   🗑  Eski hesap silindi`);
  }

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (authErr) { console.error(`   ❌  Auth hatası: ${authErr.message}`); return; }

  const userId = authData.user.id;

  await admin.from('users').update({ date_of_birth, username }).eq('id', userId);

  const sessionRows = sessions.map(s => {
    const { start_time, end_time } = buildTimes(s.daysAgo, s.hour, s.duration);
    return { user_id: userId, subject_id: s.subject, start_time, end_time, duration: s.duration, is_verified: true };
  });

  const { error: sessErr } = await admin.from('study_sessions').insert(sessionRows);
  if (sessErr) { console.error(`   ❌  Session hatası: ${sessErr.message}`); return; }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSeconds = totalMinutes * 60;
  const flowers = Math.floor(totalSeconds / 14400);

  await admin.from('users').update({ total_study_time: totalSeconds }).eq('id', userId);

  const byPeriod = { today: 0, thisWeek: 0, lastWeek: 0, older: 0 };
  sessions.forEach(s => {
    if (s.daysAgo === 0)       byPeriod.today++;
    else if (s.daysAgo <= 3)   byPeriod.thisWeek++;
    else if (s.daysAgo <= 10)  byPeriod.lastWeek++;
    else                        byPeriod.older++;
  });

  console.log(`   ✅  ${username} <${email}>`);
  console.log(`       ${sessions.length} seans · ${(totalMinutes / 60).toFixed(1)} saat · ${flowers} çiçek`);
  console.log(`       Dağılım → 3+ ay: ${byPeriod.older} | geçen hafta: ${byPeriod.lastWeek} | bu hafta: ${byPeriod.thisWeek} | bugün: ${byPeriod.today}`);
}

async function main() {
  console.log('\n🌱  FocusFlow Database Seed (v3) başlıyor...\n');
  for (const user of USERS) {
    console.log(`👤  ${user.username} oluşturuluyor...`);
    await seedUser(user);
    console.log('');
  }
  console.log('─'.repeat(60));
  console.log('✅  Seed tamamlandı!\n');
  console.log('🔑  Ana test hesabı:');
  console.log('    Email : berfin@focusflow.app');
  console.log('    Şifre : Test1234!\n');
  console.log('📋  Garden görünümleri (Berfin):');
  console.log('    Day   → Bugün 3 seans, 7. çiçek açılıyor');
  console.log('    Week  → Pazartesi + bugün = 2 gün, 6. ve 7. çiçek');
  console.log('    Month → Bu ay toplam 6 seans, 2 çiçek');
  console.log('    Year  → Tüm 7 çiçek, 3 aya yayılmış\n');
}

main().catch(err => { console.error('\n❌', err); process.exit(1); });
