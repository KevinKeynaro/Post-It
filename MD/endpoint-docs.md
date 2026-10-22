# Dokumentasi API Post It

Dokumentasi resmi endpoint, skema request body JSON, serta output JSON yang diharapkan pada REST API Post It.

---

## Kesimpulan & Ringkasan Endpoint

Berikut adalah rangkuman seluruh endpoint, hak akses, dan status implementasinya:

| No | HTTP Method | URL Endpoint | Hak Akses | Deskripsi Singkat | Status |
|:--:|:-----------:|:-------------|:----------|:------------------|:------:|
| 1 | `GET` | `/health` | Publik | Cek status server berjalan | **Aktif** |
| 2 | `POST` | `/auth/register` | Publik | Registrasi pengguna baru | **Aktif** |
| 3 | `POST` | `/auth/login` | Publik | Login & peroleh JWT token | **Aktif** |
| 4 | `GET` | `/users/me` | Bearer Token (User / Admin) | Mendapatkan profil akun login | **Aktif** |
| 5 | `POST` | `/users/me/avatar` | Bearer Token (User / Admin) | Upload gambar avatar ke Cloudinary | **Aktif** |
| 6 | `GET` | `/admin/users` | Bearer Token (Role Admin) | Melihat seluruh daftar pengguna | **Aktif** |
| 7 | `GET` | `/admin/users/:id` | Bearer Token (Role Admin) | Melihat profil pengguna spesifik | **Aktif** |
| 8 | `DELETE` | `/admin/users/:id` | Bearer Token (Role Admin) | Menghapus pengguna dari sistem | **Aktif** |
| 9 | `PUT` | `/users/me` | Bearer Token (User / Admin) | Memperbarui nama/profil akun | *Direncanakan* |

### Statistik Total Endpoint
- **Total Endpoint Aktif:** 8 Endpoint
- **Total Endpoint Direncanakan:** 1 Endpoint
- **Total Keseluruhan:** 9 Endpoint

---

## Konfigurasi Global & Autentikasi

- **Base URL:** `http://localhost:3000`
- **Content-Type:** `application/json` (kecuali upload file menggunakan `multipart/form-data`)
- **Format Header Autentikasi:**
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Format Standar Respon:**
  - Respon Berhasil:
    ```json
    {
      "success": true,
      "message": "Deskripsi pesan (opsional)",
      "data": {}
    }
    ```
  - Respon Gagal:
    ```json
    {
      "success": false,
      "message": "Keterangan penyebab error"
    }
    ```

---

## 1. Health Check

### `GET /health`
Mengecek status ketersediaan server API.

- **Status:** Aktif
- **Akses:** Publik
- **Headers:** Tidak ada
- **Body:** Tidak ada

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 2. Authentication (`/auth`)

### `POST /auth/register`
Mendaftarkan akun baru. Role otomatis diatur ke `user`.

- **Status:** Aktif
- **Akses:** Publik
- **Headers:** `Content-Type: application/json`
- **Request Body JSON:**
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **Validasi Input:**
  | Field | Tipe | Wajib | Aturan Validasi |
  |---|---|---|---|
  | `name` | string | Ya | Tidak boleh kosong (auto-trim) |
  | `email` | string | Ya | Format email valid (auto-trim & lowercase) |
  | `password` | string | Ya | Min. 6 karakter, maks. 72 karakter |

#### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "user"
  }
}
```

#### Response Gagal:
- **400 Bad Request (Validasi Gagal)**
  ```json
  {
    "success": false,
    "message": "name: Name cannot be empty; email: Invalid email format; password: Password must be at least 6 characters"
  }
  ```
- **409 Conflict (Email Terdaftar)**
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

### `POST /auth/login`
Autentikasi akun untuk memperoleh JWT token.

- **Status:** Aktif
- **Akses:** Publik
- **Headers:** `Content-Type: application/json`
- **Request Body JSON:**
  ```json
  {
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **Validasi Input:**
  | Field | Tipe | Wajib | Aturan Validasi |
  |---|---|---|---|
  | `email` | string | Ya | Format email valid |
  | `password` | string | Ya | Tidak boleh kosong |

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "user"
    }
  }
}
```

#### Response Gagal:
- **400 Bad Request (Validasi Input Gagal)**
  ```json
  {
    "success": false,
    "message": "email: Invalid email format"
  }
  ```
- **401 Unauthorized (Kredensial Salah)**
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

## 3. User Routes (`/users`)

### `GET /users/me`
Mengambil detail profil akun yang sedang login.

- **Status:** Aktif
- **Akses:** User & Admin (Perlu JWT)
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Tidak ada

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "user",
    "avatar_url": "https://res.cloudinary.com/.../image/upload/.../avatar.jpg",
    "created_at": "2026-10-22T04:15:30.000Z"
  }
}
```

#### Response Gagal:
- **401 Unauthorized (Token Tidak Ada / Tidak Valid)**
  ```json
  {
    "success": false,
    "message": "Authorization token required"
  }
  ```

---

### `POST /users/me/avatar`
Mengunggah file avatar ke Cloudinary, menghapus avatar lama dari Cloudinary (jika ada), dan memperbarui `avatar_url` serta `avatar_public_id` di database.

- **Status:** Aktif
- **Akses:** User & Admin (Perlu JWT)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Form Data:**
  | Key | Tipe | Wajib | Keterangan |
  |---|---|---|---|
  | `avatar` | File | Ya | Format: JPEG, JPG, PNG, WEBP. Maks: 2MB |

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://res.cloudinary.com/.../image/upload/v123456/post_it/avatars/sample.jpg"
  }
}
```

#### Response Gagal:
- **400 Bad Request (File Tidak Ada / Tipe File Tidak Didukung / Ukuran > 2MB)**
  ```json
  {
    "success": false,
    "message": "Avatar image is required"
  }
  ```
  *atau*
  ```json
  {
    "success": false,
    "message": "Only image files (jpeg, jpg, png, webp) are allowed"
  }
  ```
  *atau*
  ```json
  {
    "success": false,
    "message": "File too large"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "success": false,
    "message": "Authorization token required"
  }
  ```

---

### `PUT /users/me` *(Direncanakan)*
Memperbarui informasi profil akun yang sedang login.

- **Status:** Direncanakan
- **Akses:** User & Admin (Perlu JWT)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body JSON:**
  ```json
  {
    "name": "Budi Santoso Update"
  }
  ```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "Budi Santoso Update",
    "email": "budi@example.com",
    "role": "user",
    "avatar_url": null
  }
}
```

---

## 4. Admin Routes (`/admin`)

> **Catatan:**
> - Semua endpoint `/admin` mewajibkan token dengan role `admin`.
> - Kolom sensitif `password` dan `avatar_public_id` tidak pernah diekspos dalam respon JSON.

### `GET /admin/users`
Mengambil seluruh daftar pengguna di database.

- **Status:** Aktif
- **Akses:** Khusus Admin
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** Tidak ada

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin Utama",
      "email": "admin@example.com",
      "role": "admin",
      "avatar_url": null,
      "created_at": "2026-10-22T04:12:00.000Z"
    },
    {
      "id": 2,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "user",
      "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
      "created_at": "2026-10-22T04:15:30.000Z"
    }
  ]
}
```

#### Response Gagal:
- **401 Unauthorized (Token Kosong atau Tidak Valid)**
  ```json
  {
    "success": false,
    "message": "Invalid token"
  }
  ```
- **403 Forbidden (Bukan Role Admin)**
  ```json
  {
    "success": false,
    "message": "Admin access required"
  }
  ```

---

### `GET /admin/users/:id`
Melihat detail profil salah satu pengguna berdasarkan ID.

- **Status:** Aktif
- **Akses:** Khusus Admin
- **Headers:** `Authorization: Bearer <admin_token>`
- **Path Parameters:**
  - `id` (integer, misal: `/admin/users/2`)
- **Body:** Tidak ada

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "user",
    "avatar_url": null,
    "created_at": "2026-10-22T04:15:30.000Z"
  }
}
```

#### Response Gagal:
- **404 Not Found (User Tidak Ditemukan / ID Tidak Valid)**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

### `DELETE /admin/users/:id`
Menghapus akun pengguna dari database.

- **Status:** Aktif
- **Akses:** Khusus Admin
- **Headers:** `Authorization: Bearer <admin_token>`
- **Path Parameters:**
  - `id` (integer, misal: `/admin/users/2`)
- **Body:** Tidak ada
- **Proteksi:** Admin dilarang menghapus akunnya sendiri.

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Response Gagal:
- **400 Bad Request (Admin Menghapus Diri Sendiri)**
  ```json
  {
    "success": false,
    "message": "Admin cannot delete own account"
  }
  ```
- **404 Not Found (Pengguna Tidak Ditemukan)**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

## 5. Respon Error Global

Middleware terpusat menangani skenario kegagalan umum:

### Route Tidak Ditemukan (404 Not Found)
HTTP method atau rute tidak terdaftar.
```json
{
  "success": false,
  "message": "Route not found"
}
```

### Format JSON Cacat (400 Bad Request)
Request body bukan JSON valid.
```json
{
  "success": false,
  "message": "Invalid JSON body"
}
```

### Kesalahan Server Internal (500 Internal Server Error)
Kegagalan tak terduga pada server atau database.
```json
{
  "success": false,
  "message": "Internal server error"
}
```
