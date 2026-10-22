# Dokumentasi API Post It

Dokumentasi resmi endpoint, skema request body JSON, serta output JSON yang diharapkan pada REST API Post It.

---

## Ringkasan Konfigurasi & Autentikasi

- **Base URL:** `http://localhost:3000`
- **Content-Type:** `application/json` (kecuali upload file multipart/form-data)
- **Format Autentikasi:** Bearer Token via Header HTTP
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Struktur Standar Response:**
  - Sukses:
    ```json
    {
      "success": true,
      "message": "Deskripsi pesan (opsional)",
      "data": {} // Objek atau Array data
    }
    ```
  - Gagal:
    ```json
    {
      "success": false,
      "message": "Keterangan penyebab error"
    }
    ```

---

## 1. Health Check

### `GET /health`
Mengecek status dan ketersediaan server API.

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
Mendaftarkan akun baru. Akun yang didaftarkan selalu memiliki role `user`.

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
  | Field | Tipe | Wajib | Keterangan |
  |---|---|---|---|
  | `name` | string | Ya | Tidak boleh kosong (otomatis di-trim) |
  | `email` | string | Ya | Format email valid (otomatis di-trim & lowercase) |
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
- **409 Conflict (Email Sudah Terdaftar)**
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

### `POST /auth/login`
Autentikasi akun untuk memperoleh JWT token.

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
  | Field | Tipe | Wajib | Keterangan |
  |---|---|---|---|
  | `email` | string | Ya | Format email valid |
  | `password` | string | Ya | Tidak boleh kosong |

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE2...",
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
- **401 Unauthorized (Email atau Password Salah)**
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

## 3. Admin Routes (`/admin`)

> **Catatan Keamanan:**
> - Seluruh rute `/admin` memerlukan Header `Authorization: Bearer <token>` milik akun dengan role `admin`.
> - Kolom `password` dan `avatar_public_id` tidak pernah ditampilkan pada respon.

### `GET /admin/users`
Mengambil seluruh daftar pengguna yang terdaftar di database.

- **Akses:** Khusus Admin
- **Headers:**
  ```http
  Authorization: Bearer <admin_token>
  ```
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
      "avatar_url": null,
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
    "message": "Authorization token required"
  }
  ```
  *atau*
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
Melihat profil detail satu pengguna berdasarkan ID.

- **Akses:** Khusus Admin
- **Headers:**
  ```http
  Authorization: Bearer <admin_token>
  ```
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
Menghapus akun pengguna berdasarkan ID.

- **Akses:** Khusus Admin
- **Headers:**
  ```http
  Authorization: Bearer <admin_token>
  ```
- **Path Parameters:**
  - `id` (integer, misal: `/admin/users/2`)
- **Body:** Tidak ada
- **Aturan Proteksi:** Admin tidak diizinkan menghapus akun miliknya sendiri.

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

## 4. User Routes (`/users`) *(Direncanakan)*

Rute profil untuk pengguna yang sedang login (`req.user.id`).

### `GET /users/me`
Mengambil detail profil akun yang sedang login.

- **Akses:** User & Admin (JWT required)
- **Headers:** `Authorization: Bearer <token>`
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

---

### `PUT /users/me`
Memperbarui informasi profil pengguna yang sedang login.

- **Akses:** User & Admin (JWT required)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
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
    "id": 2,
    "name": "Budi Santoso Update",
    "email": "budi@example.com",
    "role": "user",
    "avatar_url": null
  }
}
```

---

### `POST /users/me/avatar`
Mengunggah gambar profil ke Cloudinary dan memperbarui `avatar_url` serta `avatar_public_id`.

- **Akses:** User & Admin (JWT required)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Form Data:**
  - `avatar`: File gambar (JPG/PNG/WEBP, maks. 2MB - 5MB)

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://res.cloudinary.com/.../image/upload/.../avatar.jpg"
  }
}
```

---

## 5. Respon Error Global

API dilengkapi middleware terpusat untuk menangani kondisi error umum:

### Route Tidak Ditemukan (404 Not Found)
Terjadi jika memanggil URL endpoint atau HTTP Method yang tidak terdaftar.
```json
{
  "success": false,
  "message": "Route not found"
}
```

### Syntax JSON Tidak Valid (400 Bad Request)
Terjadi jika request body mengandung payload JSON cacat (malformed JSON).
```json
{
  "success": false,
  "message": "Invalid JSON body"
}
```

### Server Error Internal (500 Internal Server Error)
Terjadi jika terjadi kegagalan sistem internal pada database atau server.
```json
{
  "success": false,
  "message": "Internal server error"
}
```
