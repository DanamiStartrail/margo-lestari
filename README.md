# 🌧️ Sistem Informasi Prediksi Curah Hujan Desa Margo Lestari

![Deployment](https://img.shields.io/badge/deployment-Live%20on%20Render-46E3B7?logo=render&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![BMKG API](https://img.shields.io/badge/data-BMKG%20API-1F6FEB)

**Sistem Informasi Prediksi Curah Hujan Desa Margo Lestari** adalah service backend berbasis **Node.js dan TypeScript** yang mengolah data prakiraan cuaca dari **BMKG** dan **Open-Meteo**, kemudian menyiarkannya secara otomatis melalui **Baileys WhatsApp** ke WhatsApp Community atau Channel warga Desa Margo Lestari.

Proyek ini dikembangkan sebagai bagian dari **Tugas Besar Mata Kuliah Kapita Selekta Informatika, Program Studi Teknik Informatika, Fakultas Teknologi Industri (FTI), Institut Teknologi Sumatera (ITERA)**.

---

## 📍 Latar Belakang & Target SDGs Desa

Desa Margo Lestari, Kecamatan Jati Agung, Kabupaten Lampung Selatan, berada di wilayah dataran rendah yang berpotensi mengalami genangan atau banjir ketika curah hujan tinggi. Informasi cuaca yang ringkas, berkala, dan mudah dijangkau diharapkan dapat membantu warga mengantisipasi kondisi tersebut, terutama dalam aktivitas pertanian dan kegiatan sehari-hari.

Sistem ini mendukung **SDGs Desa Tujuan 13: Desa Tanggap Perubahan Iklim**, khususnya **Indikator 13.2.3 - Sistem Peringatan Dini Bencana** melalui pengolahan data cuaca dan penyebaran notifikasi peringatan dini berbasis WhatsApp.

---

## 👥 Anggota Kelompok & Pembagian Peran

| No. | Nama | NIM | Peran |
|---:|---|---:|---|
| 1 | Reza Lesmana Julgi | 124140115 | Koordinator Desa |
| 2 | Gathan Mahendra | 124140201 | Back End Developer |
| 3 | Muhammad Ridho Arizky | 124140085 | WhatsApp Automation |
| 4 | Mandanta Guru Singa | 124140147 | Project Manager |
| 5 | Muhammad Riyan Daris | 124140146 | Back End Developer |
| 6 | Muhammad Farel Ramadhani | 124140221 | Testing |

---

## 🏗️ Arsitektur Sistem & Fitur Utama

Alur utama sistem adalah:

```text
BMKG API ───────┐
                ├─> Weather Processing ─> Rainfall Level Engine
Open-Meteo API ─┘                              │
                                              ├─> JSONL & System Log
                                              └─> WhatsApp Broadcast
                                                   └─> Community / Channel
```

### 🌦️ Multi-Source Weather Data Ingestion

- Mengambil data utama dari API publik BMKG menggunakan kode wilayah `adm4=18.01.13.2012`.
- Mengambil data pembanding atau cadangan dari Open-Meteo API pada:
  - Latitude: `-5.2933`
  - Longitude: `105.3409`
- Kedua sumber diproses secara paralel untuk memperoleh pembaruan cuaca yang lebih informatif.

### 📊 Data Processing & Rainfall Level Engine

Mesin evaluasi menggunakan nilai curah hujan tertinggi dari kedua sumber:

| Curah hujan | Status | Makna |
|---:|---|---|
| `< 20 mm` | 🟢 **AMAN** | Kondisi relatif kondusif |
| `20-<50 mm` | 🟡 **WASPADA** | Potensi hujan sedang; warga perlu bersiap |
| `>= 50 mm` | 🔴 **SIAGA** | Potensi hujan lebat dan genangan/luapan air |

### 🔐 Persistent Auth Session

Sesi autentikasi WhatsApp Baileys disimpan menggunakan adapter MongoDB Atlas melalui `useMongoAuthState`. Dengan demikian, sesi dapat dipertahankan ketika server mengalami restart atau re-deploy.

### ⏰ Automated Cron Scheduler

Penarikan data dan pengiriman broadcast dijadwalkan menggunakan `node-cron`. Jadwal default adalah setiap tiga jam (`0 */3 * * *`) dan dapat diubah melalui environment variable.

### 🛰️ Interactive Radar Integration

Setiap pesan broadcast menyertakan tautan live radar pergerakan awan hujan dari **RainViewer** untuk membantu warga memantau kondisi cuaca secara visual.

### 📝 System Logging & Analytics

- `logs/system.log`: catatan aktivitas, peringatan, dan error sistem.
- `logs/weather_history.jsonl`: riwayat data cuaca terstruktur dalam format JSON Lines untuk validasi, pengujian, dan analisis penggunaan.

### 💓 Anti-Sleep Express Dummy HTTP Server

Service menyediakan endpoint health-check `GET /` menggunakan Express agar dapat dipantau oleh Render dan diping berkala melalui UptimeRobot. Port mengikuti `PORT` dari environment hosting; secara lokal sistem menggunakan fallback port `3000` dan dapat diarahkan ke port `8000` bila diperlukan.

---

## 📁 Struktur Direktori Proyek

```text
.
├── src/
│   ├── config/
│   │   └── env.ts                 # Konfigurasi environment dan endpoint API
│   ├── services/
│   │   ├── mongoAuth.ts           # Persistent auth Baileys di MongoDB Atlas
│   │   ├── openmeteo.ts           # Integrasi Open-Meteo
│   │   ├── weather.ts             # Integrasi API BMKG
│   │   └── whatsapp.ts             # Koneksi dan broadcast WhatsApp
│   ├── types/
│   │   ├── openmeteo.ts            # Tipe respons Open-Meteo
│   │   └── weather.ts              # Tipe respons BMKG
│   ├── utils/
│   │   ├── formatter.ts            # Evaluasi level hujan dan format pesan
│   │   └── logger.ts               # System log dan riwayat JSONL
│   ├── index.ts                    # Entry point service dan scheduler
│   └── test-broadcast.ts           # Simulasi pesan AMAN/WASPADA/SIAGA
├── logs/                           # Dibuat otomatis saat service berjalan
│   ├── system.log
│   └── weather_history.jsonl
├── Dockerfile
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## ✅ Status Progress & Checklist Milestone

- [x] Validasi endpoint dan schema parsing API BMKG & Open-Meteo
- [x] Implementasi data processing & weather evaluation engine
- [x] Integrasi MongoDB Atlas session adapter (Baileys WhatsApp)
- [x] Pembuatan Express dummy server & logging system (JSONL)
- [x] Deployment ke cloud hosting (Render) & setup UptimeRobot (anti-sleep 24/7)
- [x] Penautan WhatsApp target (Community Announcement / Channel Group)
- [ ] Testing & validation (black-box testing & usage log)
- [ ] Sosialisasi ke perangkat desa & penempelan QR Code komunitas

---

## 🚀 Panduan Instalasi & Pengembangan Lokal

### Prasyarat

- Node.js versi **18 atau lebih baru**
- npm
- MongoDB Atlas
- Akun/perangkat WhatsApp untuk proses autentikasi Baileys

### Instalasi

```bash
git clone https://github.com/DanamiStartrail/margo-lestari.git
cd margo-lestari
npm install
```

Buat file `.env` di root repositori:

```env
BMKG_ADM4=18.01.13.2012
OPEN_METEO_LAT=-5.2933
OPEN_METEO_LON=105.3409
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
WHATSAPP_TARGET_JID=<community-atau-channel-jid>
CRON_SCHEDULE=0 */3 * * *
```

### Environment Variables

| Variabel | Wajib | Contoh | Keterangan |
|---|:---:|---|---|
| `BMKG_ADM4` | Tidak | `18.01.13.2012` | Kode wilayah administrasi BMKG |
| `OPEN_METEO_LAT` | Tidak | `-5.2933` | Latitude lokasi Desa Margo Lestari |
| `OPEN_METEO_LON` | Tidak | `105.3409` | Longitude lokasi Desa Margo Lestari |
| `MONGODB_URI` | Ya | `mongodb+srv://...` | URI MongoDB Atlas untuk sesi Baileys |
| `WHATSAPP_TARGET_JID` | Ya | `<target-jid>` | JID Community Announcement atau Channel |
| `CRON_SCHEDULE` | Tidak | `0 */3 * * *` | Jadwal cron pengambilan dan broadcast |
| `PORT` | Tidak | `8000` | Port HTTP health-check; disediakan hosting jika tersedia |
| `TZ` | Tidak | `Asia/Jakarta` | Zona waktu deployment |

> **Keamanan:** jangan commit file `.env`, URI MongoDB, QR code, atau kredensial WhatsApp ke repositori.

### Menjalankan Service

Jalankan service utama:

```bash
npx tsx src/index.ts
```

Pada autentikasi pertama, pindai QR Code yang tampil di terminal. Setelah sesi tersimpan di MongoDB Atlas, proses autentikasi dapat digunakan kembali pada restart berikutnya.

### Pengujian Format Broadcast

Untuk menjalankan simulasi tiga kondisi cuaca (`AMAN`, `WASPADA`, dan `SIAGA`):

```bash
npx tsx src/test-broadcast.ts
```

---

## ☁️ Panduan Deployment Production - Render

1. Hubungkan repositori GitHub ke layanan Web Service di Render.
2. Pilih runtime **Node**.
3. Gunakan konfigurasi berikut:

   | Pengaturan | Nilai |
   |---|---|
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Time Zone | `TZ=Asia/Jakarta` |

4. Tambahkan environment variables pada menu **Environment** Render, terutama `MONGODB_URI`, `WHATSAPP_TARGET_JID`, `BMKG_ADM4`, `OPEN_METEO_LAT`, `OPEN_METEO_LON`, dan `CRON_SCHEDULE`.
5. Pastikan endpoint `GET /` dapat diakses oleh Render dan UptimeRobot.
6. Untuk deployment pertama, pantau log Render dan lakukan pemindaian QR WhatsApp apabila sesi MongoDB belum tersedia.

Render biasanya menyediakan nilai `PORT` secara otomatis. Aplikasi menggunakan nilai tersebut untuk server Express sehingga health-check dapat berjalan sesuai konfigurasi platform.

---

## 🔗 Sumber Data & Referensi

- [BMKG - API Prakiraan Cuaca Publik](https://api.bmkg.go.id/)
- [Open-Meteo API](https://open-meteo.com/)
- [RainViewer Weather Radar](https://www.rainviewer.com/weather-radar-map-live.html)
- [Baileys WhatsApp Web API](https://github.com/WhiskeySockets/Baileys)
- [Render](https://render.com/)

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan akademik **Tugas Besar Kapita Selekta Informatika FTI Teknik Informatika ITERA**.
