# Tech Stack Dokumen: Proyek Post It

Dokumentasi komprehensif mengenai seluruh teknologi, runtime, framework, pustaka (*libraries*), basis data, serta perangkat pendukung pengembangan yang digunakan pada arsitektur REST API **Post It**.

---

## 1. Arsitektur & Pendekatan Utama

- **Model Aplikasi:** Backend-only RESTful API (Headless API).
- **Arsitektur Kode:** Layered MVC Modular (Route -> Middleware -> Controller -> Database).
- **Modul Sistem:** CommonJS (`require` / `module.exports`).
- **Autentikasi:** Stateless Token-based via JSON Web Token (Bearer Token).

---

## 2. Runtime & Core Framework

| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Runtime Environment** | Node.js | v18+ / v20+ LTS | Lingkungan eksekusi JavaScript sisi server berbasis event-driven non-blocking I/O. |
| **Web Framework** | Express.js | `^5.3.0` | Framework minimalis dan fleksibel untuk routing HTTP, mounting middleware, penanganan request/response, dan penanganan error terpusat. |

---

## 3. Basis Data & Data Access Layer

| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **RDBMS** | MySQL | 8.x | Database relasional untuk menyimpan tabel terstruktur (`users`, `posts`) dengan relasi foreign key dan integritas referensial. |
| **Driver / Client** | `mysql2` | `^3.24.6` | Driver MySQL performa tinggi untuk Node.js. Digunakan modul `mysql2/promise` dengan mekanisme *Connection Pooling* untuk kueri asinkron berbasis Promise dan perlindungan terhadap SQL Injection via *parameterized queries* (`?`). |

---

## 4. Keamanan & Autentikasi

| Komponen | Pustaka / Paket | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Password Hashing** | `bcrypt` | `^6.0.0` | Algoritma hashing adaptif searah (one-way hashing) dengan salt dinamis (10 rounds) untuk mengenkripsi kata sandi pengguna sebelum disimpan ke database. |
| **Token Autentikasi** | `jsonwebtoken` | `^9.0.3` | Pembuatan dan verifikasi token JWT (*JSON Web Token*) bertanda tangan HMAC SHA-256 (`HS256`) untuk autentikasi stateless dan otorisasi berbasis peran (*role-based access control*). |

---

## 5. Validasi Data & Sanitasi

| Komponen | Pustaka / Paket | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Schema Validation** | `zod` | `^4.6.7` | Validasi skema deklaratif type-safe untuk memvalidasi dan menyaring request body (misal sanitasi email `trim()` dan `toLowerCase()`, batasan panjang password, serta format input). Terintegrasi melalui custom middleware `validate.js`. |

---

## 6. Penanganan Berkas & Cloud Media Storage

| Komponen | Pustaka / Paket | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Multipart Parser** | `multer` | `^2.4.0` | Middleware penanganan request `multipart/form-data`. Menggunakan strategi `memoryStorage()` (buffer RAM) dengan filter tipe berkas (JPEG, PNG, WEBP) dan limit ukuran maksimal 2MB. |
| **Cloud CDN & Storage** | `cloudinary` | `^2.11.0` | SDK integrasi Cloudinary API v2 untuk mengunggah stream buffer gambar avatar pengguna secara aman ke cloud, menghasilkan CDN URL teroptimasi, serta menghapus aset media via `public_id`. |

---

## 7. Konfigurasi Lingkungan (*Environment Variables*)

| Komponen | Pustaka / Paket | Versi | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Environment Loader** | `dotenv` | `^18.0.8` | Membaca variabel rahasia dan konfigurasi dari berkas `.env` ke dalam `process.env` (kredensial database, port server, JWT secret, dan API key Cloudinary) untuk menjaga keamanan kode sumber. |

---

## 8. Perkakas Pengembangan (*Developer Tooling*)

| Komponen | Perangkat / Alat | Versi / Tipe | Peran & Alasan Penggunaan |
|---|---|---|---|
| **Dev Live Reload** | `nodemon` | `^3.1.14` (*devDependency*) | Utilitas pemantau perubahan berkas (*file watcher*) yang merestart server Node.js otomatis selama proses pengembangan (`npm run dev`). |
| **Local Server Stack** | Laragon | Windows Native | Lingkungan server lokal portabel untuk menjalankan servis MySQL Server pada port `3306`. |
| **Database GUI** | MySQL Workbench | Desktop GUI | Perangkat visual untuk mendesain skema, inspeksi tabel, manipulasi data manual, dan pembuatan akun admin awal. |
| **API Client** | Postman | Desktop App | Perangkat pengujian manual seluruh alur endpoint REST API, transmisi Bearer Token, dan simulasi request multipart form-data. |
| **Version Control** | Git & GitHub | VCS | Manajemen kontrol versi repositori dan kolaborasi tim. |

---

## 9. Rekapitulasi Dependensi `package.json`

### Production Dependencies (`dependencies`)
```json
{
  "bcrypt": "^6.0.0",
  "cloudinary": "^2.11.0",
  "dotenv": "^18.0.8",
  "express": "^5.3.0",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.4.0",
  "mysql2": "^3.24.6",
  "zod": "^4.6.7"
}
```

### Development Dependencies (`devDependencies`)
```json
{
  "nodemon": "^3.1.14"
}
```
