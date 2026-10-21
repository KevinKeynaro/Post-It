# Laporan Analisis Proyek: `package.json` dan Folder `src/`

Laporan ini menyajikan hasil evaluasi struktur, dependensi, dan status implementasi kode pada proyek REST API **Post It**.

---

## 1. Analisis `package.json`

### 1.1 Metadata & Script
- **Nama & Versi**: `post-it` (v1.0.0).
- **Format Modul**: `"type": "commonjs"` (menggunakan `require` / `module.exports`).
- **Entry Point Utama**: `"main": "index.js"`.
  - *Temuan*: File `index.js` **tidak ada** di root proyek. Entry point riil proyek berada di `src/app.js`.
- **Scripts**:
  - `dev`: `nodemon src/app.js` (efektif untuk *live reload* pengembangan).
  - `start`: `node src/app.js` (efektif untuk produksi).
  - `test`: placeholder gagal default (`echo "Error: no test specified" && exit 1`).

### 1.2 Dependensi (`dependencies`)
| Paket | Versi | Status Penggunaan di `src/` | Analisis / Catatan |
|---|---|---|---|
| `express` | `^5.3.0` | Aktif | Menggunakan Express versi 5 terbaru. Mendukung penanganan error promise otomatis. |
| `dotenv` | `^18.0.8` | Aktif | Digunakan di `src/app.js` dan `src/db/connection.js` untuk parsing `.env`. |
| `mysql2` | `^3.24.6` | Aktif | Digunakan di `src/db/connection.js` via `mysql2/promise` (connection pooling). |
| `zod` | `^4.6.7` | Aktif | Digunakan di `src/validations/auth.schema.js` dan `src/middleWares/validate.js`. Versi 4 (alpha/beta/canary) terpasang. |
| `jsonwebtoken` | `^9.0.3` | Parsial | Di-import di `src/middleWares/verifyToken.js`, namun logika verifikasi belum aktif. |
| `bcrypt` | `^6.0.0` | Belum Aktif | Terpasang, siap digunakan pada hashing password di auth controller. |
| `multer` | `^2.4.0` | Belum Aktif | Terpasang, siap digunakan di middleware `src/middleWares/upload.js`. |
| `cloudinary` | `^2.11.0` | Belum Aktif | Terpasang, file konfigurasi `src/config/cloudinary.js` masih kosong. |

### 1.3 Dependensi Pengembangan (`devDependencies`)
- `nodemon`: `^3.1.14` (digunakan pada script `npm run dev`).

---

## 2. Analisis Struktur dan Modul Folder `src/`

Struktur folder mengadopsi arsitektur MVC layer modular Express.js.

### 2.1 File Utama: `src/app.js`
- **Fungsi**: Setup Express app, middleware global parser (`express.json`, `express.urlencoded`), handler 404, dan handler error pusat.
- **Temuan**:
  - Terdapat endpoint pengujian sementara `POST /test-validate` yang masih terdaftar langsung di `app.js`.
  - Belum melakukan mounting terhadap router modular (`auth.routes`, `user.routes`, `admin.routes`).

### 2.2 Subfolder `src/middleWares/`
Folder middleware ditulis dengan konvensi huruf kapital W (`middleWares`).
- `notFound.js`: **Selesai**. Menangani request ke endpoint yang tidak terdaftar (HTTP 404).
- `errorHandler.js`: **Selesai**. Menangani parsing JSON error (`entity.parse.failed`), status eksplisit, serta fallback HTTP 500.
- `validate.js`: **Selesai**. Middleware factory berbasis Zod safeParse yang memformat error per field dan menimpa `req.body` dengan data valid.
- `verifyToken.js`: **Stub/Placeholder**. Hanya memanggil `next()` tanpa validasi header `Authorization: Bearer <token>`.
- `isAdmin.js`: **Stub/Placeholder**. Hanya memanggil `next()` tanpa pengecekan `req.user.role === 'admin'`.
- `upload.js`: **Stub/Placeholder**. Mengekspor objek kosong `{}`.

### 2.3 Subfolder `src/validations/`
- `auth.schema.js`: **Selesai**.
  - `registerSchema`: validasi field `name`, `email`, `password` (min 6 char), `.strict()` (menolak field luar seperti `role`).
  - `loginSchema`: validasi `email` dan `password`, `.strict()`.

### 2.4 Subfolder `src/db/`
- `connection.js`: **Selesai**. Membuat `mysql.createPool` berbasis environment variable (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) dengan limit koneksi 10 dan uji koneksi awal.
- `models/User.js`: **Stub/Kosong**.
- `models/Post.js`: **Stub/Kosong**.
  *(Catatan: Sesuai AGENTS.md, arsitektur memakai query langsung melalui connection pool atau data layer tipis).*

### 2.5 Subfolder `src/controllers/`
- `auth.controller.js`: **Stub/Kosong** (`module.exports = {};`).
- `user.controller.js`: **Stub/Kosong** (`module.exports = {};`).
- `admin.controller.js`: **Stub/Kosong** (`module.exports = {};`).

### 2.6 Subfolder `src/routes/`
- `auth.routes.js`: Router Express diinisialisasi tanpa rute aktif.
- `user.routes.js`: Router Express diinisialisasi tanpa rute aktif.
- `admin.routes.js`: Router Express diinisialisasi tanpa rute aktif.

### 2.7 Subfolder `src/config/`
- `cloudinary.js`: **Kosong (0 byte)**. Belum ada konfigurasi `cloudinary.v2.config()`.

---

## 3. Matriks Status Implementasi

| Komponen | File | Status | Keterangan |
|---|---|---|---|
| Konfigurasi Cloudinary | `src/config/cloudinary.js` | Belum Dibuat | Masih kosong 0 byte |
| Database Pool | `src/db/connection.js` | Selesai | Siap pakai via pool `mysql2/promise` |
| Validasi Auth | `src/validations/auth.schema.js` | Selesai | Validasi Zod register & login |
| Middleware Validate | `src/middleWares/validate.js` | Selesai | Teruji mengintegrasikan Zod |
| Middleware Error | `src/middleWares/errorHandler.js` | Selesai | Central error handler aktif |
| Middleware 404 | `src/middleWares/notFound.js` | Selesai | 404 handler aktif |
| Middleware Auth | `src/middleWares/verifyToken.js` | Stub | Perlu verifikasi JWT Bearer |
| Middleware Role | `src/middleWares/isAdmin.js` | Stub | Perlu otorisasi role admin |
| Middleware Upload | `src/middleWares/upload.js` | Stub | Perlu integrasi Multer memory storage |
| Controller Auth | `src/controllers/auth.controller.js` | Stub | Logika register & login belum dibuat |
| Controller User | `src/controllers/user.controller.js` | Stub | Profil & avatar belum dibuat |
| Controller Admin | `src/controllers/admin.controller.js` | Stub | Manajemen user admin belum dibuat |
| Router | `src/routes/*.js` | Stub | Rute belum didaftarkan dan belum di-mount di `app.js` |

---

## 4. Temuan Utama & Rekomendasi Tindak Lanjut

1. **Perbaikan `package.json`**:
   Ubah `"main": "index.js"` menjadi `"main": "src/app.js"` agar sesuai dengan berkas eksekusi aplikasi.
2. **Implementasi Autentikasi (`auth.controller.js` & `auth.routes.js`)**:
   - `POST /auth/register`: hash password dengan `bcrypt`, simpan ke tabel `users` dengan role pakem `user`.
   - `POST /auth/login`: validasi password dengan `bcrypt.compare`, buat token JWT via `jsonwebtoken`.
3. **Penyelesaian Middleware Autentikasi & Otorisasi**:
   - `verifyToken.js`: ekstrak token dari header `Authorization: Bearer <token>`, verifikasi dengan `JWT_SECRET`, simpan payload ke `req.user`.
   - `isAdmin.js`: verifikasi `req.user.role === 'admin'`, tolak dengan status 403 jika bukan admin.
4. **Konfigurasi Cloudinary & Multer**:
   - Isi `src/config/cloudinary.js` dengan kredensial dari `process.env`.
   - Konfigurasi `src/middleWares/upload.js` memakai `multer` (tipe image, batas ukuran berkas).
5. **Mounting Routes & Pembersihan di `src/app.js`**:
   - Mount router ke prefix `/auth`, `/users`, `/admin`.
   - Hapus route pengujian sementara `POST /test-validate`.
