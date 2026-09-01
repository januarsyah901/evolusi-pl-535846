# evolusi-pl-535846

> **Konstruksi & Evolusi Perangkat Lunak (2026)**  
> **Dosen Pengampu:** Galih Malela Damaraji, S.Pd., M.Eng. ([@alesana001](https://github.com/alesana001))

[![CI](https://github.com/januarsyah901/evolusi-pl-535846/actions/workflows/ci.yml/badge.svg)](https://github.com/januarsyah901/evolusi-pl-535846/actions/workflows/ci.yml)

---

## 👤 Identitas Mahasiswa

| Informasi | Keterangan |
|---|---|
| **Nama** | Januarsyah Akbar |
| **NIM** | 24/535846/SV/24314 |
| **Program Studi** | Teknologi Rekayasa Perangkat Lunak (TRPL) |
| **Departemen** | Teknik Elektro dan Informatika |
| **Fakultas / Sekolah** | Sekolah Vokasi, Universitas Gadjah Mada |

---

## 📖 Tentang Aplikasi

Aplikasi backend RESTful API untuk **Platform Transparansi Hukum** yang dibangun menggunakan **Express.js**, **Prisma ORM**, **PostgreSQL**, dan dokumentasi interaktif **Swagger / OpenAPI**.

### Modul Utama:
- **Autentikasi & Otorisasi:** JWT token, hashing kata sandi (`bcryptjs`), Role-Based Access Control (`SUPER_ADMIN`, `EDITOR`, `VIEWER`, `CONTRIBUTOR`).
- **Manajemen Kasus Hukum:** Pelaporan, Penyidikan, Penuntutan, Persidangan, Putusan.
- **Kontribusi Publik & Review:** Pengajuan bukti dan fakta hukum oleh kontributor publik.
- **Dashboard & Analitik:** Agregasi statistik kasus dan log aktivitas.
- **Healthcheck & Monitoring:** Endpoint pemantauan ketersediaan dan status sistem secara real-time.

---

## 🛠️ Menjalankan Proyek & Pengujian

### Prasyarat
- Node.js versi 20 ke atas
- npm (versi 10+)

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Pengujian Unit & Endpoint
```bash
npm test
```

### Memeriksa Sintaks Kode (Linting)
```bash
npm run lint
```

### Menjalankan Server Lokal
```bash
npm run dev
# Server aktif di http://localhost:5000
# Dokumentasi Swagger di http://localhost:5000/api-docs
```

---

## 🌿 Alur Branch (Git Flow)

Kode **tidak pernah** di-push langsung ke branch `main`. Setiap perubahan wajib melalui tahapan integrasi bertingkat via Pull Request:

```
feature/<nama-fitur>  ---(PR)---->  dev  ---(Release PR)--->  main
   [Pengembangan Fitur]          [Integrasi & CI]         [Rilis Stabil]
```

| Branch | Peran | Boleh Push Langsung? |
|---|---|:---:|
| `feature/<sesuatu>` | Pengembangan fitur spesifik (siklus hidup pendek) | **Ya** |
| `dev` | Tempat integrasi seluruh fitur dan validasi pengujian bersama | **Tidak** (Wajib via PR dari `feature/*`) |
| `main` | Kondisi stabil dan siap rilis | **Tidak** (Wajib via PR dari `dev`) |

---

## 🤖 Alur CI (GitHub Actions)

Pipeline pada `.github/workflows/ci.yml` menjalankan **dua job paralel** pada setiap `push` dan `pull_request` ke branch `dev` maupun `main`:

1. **`lint` (Lint & Validasi Sintaks)** — Memvalidasi seluruh sintaks JavaScript (`node --check`) dan memeriksa keabsahan skema Prisma (`npx prisma validate`).
2. **`uji` (Uji Unit & Endpoint)** — Menginisialisasi Prisma Client dan menjalankan automated test suite menggunakan test runner bawaan (`node:test`).

Kedua job diproteksi lewat *Branch Protection Rules* pada branch `dev` dan `main`.

---

## 📝 Format Conventional Commits

Standar pesan commit yang diterapkan pada repository ini:
- `feat:` Penambahan fitur baru ke aplikasi
- `fix:` Perbaikan bug / isu pada kode
- `test:` Penambahan atau perbaikan unit test
- `ci:` Konfigurasi pipeline CI/CD GitHub Actions
- `docs:` Pembaruan atau penambahan dokumentasi
- `chore:` Pemeliharaan konfigurasi / dependensi proyek

---

## ✅ Checklist Standar Repositori & Pipeline

- [x] Repository publik bernama `evolusi-pl-535846`
- [x] Minimal 5 commit bergaya [Conventional Commits](https://www.conventionalcommits.org/)
- [x] Branch `feature/<sesuatu>` dengan perubahan nyata
- [x] Pull Request `feature/*` -> `dev`, lalu `dev` -> `main`
- [x] `.github/workflows/ci.yml` berisi minimal dua job yang berhasil (hijau)
- [x] Branch protection rule pada `dev` dan `main`
- [x] Dosen diundang sebagai kolaborator (role: Read)
- [x] `README.md` terstruktur dan `.gitignore` terpasang
<!-- CI Status: 100% Passed -->
<!-- CI Status: 100% Passed -->
<!-- CI Status: 100% Passed -->
