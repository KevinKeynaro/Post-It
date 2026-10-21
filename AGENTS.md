# AGENTS.md

Guidance for AI coding agents working on **Post It**.

## Project overview

Post It is a backend-only REST API built with Express.js. There is **no frontend**; everything is tested with Postman.

Core flow:

- **User:** logs in, receives a JWT, puts it in Postman's Authorization tab (Bearer Token) to be verified.
- **Admin:** logs in, receives a JWT, can view users (never their passwords) and delete users. Admin routes require a valid JWT and the `admin` role.

The assignment does not clearly say what the CRUD and the Cloudinary image upload should apply to. Working assumption (not confirmed):

- CRUD applies to **users** (and optionally **posts**).
- Cloudinary is used for an **image upload** (user avatar and/or post image).

If the assignment is clarified, update this section first.

## Tech stack

- Node.js + Express.js
- MySQL (run through Laragon, managed with MySQL Workbench), driver: `mysql2/promise`
- Zod for request validation
- JSON Web Tokens (`jsonwebtoken`) for auth
- `bcrypt` for password hashing
- Cloudinary (+ `multer` for multipart parsing) for image uploads
- `dotenv` for configuration

## Commands

```bash
npm install          # install dependencies
npm run dev          # start with nodemon (add this script if missing)
npm start            # node src/app.js
```

Database: start Laragon (Start All) so MySQL is running, then use MySQL Workbench on `127.0.0.1:3306`.

## Folder structure

```
Post It/
├── src/
│   ├── app.js            # express setup, route mounting, error handler
│   ├── config/           # cloudinary.js (planned)
│   ├── db/
│   │   └── connection.js # mysql2 pool (done)
│   ├── validations/      # Zod schemas (planned)
│   ├── middleWares/      # verifyToken, isAdmin, validate, upload
│   ├── controllers/      # auth, user, admin (and post if needed)
│   └── routes/           # auth.routes, user.routes, admin.routes
├── AGENTS.md
├── README.md
├── package.json
└── .env                  # never commit
```

Note: the middleware folder is spelled `middleWares` (capital W). Keep that spelling in imports.

## Environment variables (`.env`)

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=post_it
JWT_SECRET=<long random string>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env` or print secrets in logs.

## Database schema

Database: `post_it`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- bcrypt hash
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(500) NULL,            -- Cloudinary secure_url
  avatar_public_id VARCHAR(255) NULL,      -- used to delete the Cloudinary image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT,
  image_url VARCHAR(500) NULL,
  image_public_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

The admin account is created manually in MySQL Workbench (an INSERT with a bcrypt hash), because registration always creates role `user`.

## Planned API

Auth (public)
- `POST /auth/register` - Zod validation, bcrypt hash, role forced to `user`
- `POST /auth/login` - verify password, return JWT containing `id` and `role`

User (JWT required)
- `GET /users/me`
- `PUT /users/me`
- `POST /users/me/avatar` - upload image to Cloudinary, save `avatar_url` and `avatar_public_id`
- `DELETE /users/me` (optional)

Admin (JWT + admin role)
- `GET /admin/users` - list users, **password excluded**
- `GET /admin/users/:id` - one user, **password excluded**
- `DELETE /admin/users/:id` - delete user and their Cloudinary image(s)

Posts (optional, only if the assignment needs them)
- Standard CRUD under `/posts`, with an optional image upload to Cloudinary.

## Conventions

- Language: JavaScript, CommonJS (`require` / `module.exports`). If `package.json` has `"type": "module"`, switch to ES modules consistently.
- Modular code: Setiap middleware, controller, dan schema ditulis di file sendiri, di-export dengan `module.exports`, dan di-require di tempat dipakai.
- Peran `app.js`: Hanya merakit aplikasi (parser, mounting router, notFound handler, error handler). Tidak ada logika bisnis di `app.js`.
- Penggunaan middleware: Middleware seperti `verifyToken` dan `isAdmin` dipasang di file route, bukan di `app.js`.
- Prinsip pakai-ulang (reusability): Tulis logika berulang (verifyToken, isAdmin, validate, upload, Cloudinary cleanup) satu kali di file khusus, lalu require. Hindari duplikasi logika.
- Use the shared pool from `src/db/connection.js`; always use parameterized queries (`?` placeholders), never string-concatenated SQL.
- Validate every request body with Zod through the `validate` middleware. `registerSchema` tidak strict (field tak dikenal diabaikan Zod, role dipakemkan 'user' di controller).
- Parameter `:id` rute diproses langsung oleh prepared statement; id tidak valid atau tidak ditemukan menghasilkan 404 "User not found" (tanpa middleware validateId).
- Never return the `password` column in any response. Select columns explicitly instead of `SELECT *` on `users`.
- JWT is read from the `Authorization: Bearer <token>` header. `verifyToken` memakai pesan tunggal "Invalid token" (baik kedaluwarsa maupun token acak) dan sets `req.user = { id, role }` dari database; `isAdmin` checks `req.user.role === 'admin'`.
- Use consistent JSON responses and proper status codes (400 validation, 401 no/invalid token, 403 not admin, 404 not found, 409 duplicate email).
- Handle errors with a central error-handling middleware in `app.js`.
- Keep controllers thin and readable; this is a student assignment, so prefer simple, well-commented code over abstractions.

## Current status

Done
- MySQL database and schema designed (`users`, `posts`)
- `src/db/connection.js` (mysql2 pool)
- `.env` template dan `.gitignore` (.env terlindungi)
- `package.json` entry point diarahkan ke `src/app.js`
- `multer` & `nodemon` terpasang, script `npm run dev` ditambahkan
- `src/app.js` (express setup, json parsing, central error handling, 404 handler berbahasa Inggris)
- Zod schemas (`src/validations/auth.schema.js`): sanitasi email (trim & lowercase), batasan password (6-72 char), registerSchema non-strict
- Middleware `validate.js`
- Helper pembuatan JWT modular (`src/utils/token.js`)
- `POST /auth/register` dan `POST /auth/login` (`src/controllers/auth.controller.js` & `src/routes/auth.routes.js`), di-mount di `/auth` pada `src/app.js`
- `src/middleWares/verifyToken.js` (ekstraksi header Bearer, verifikasi HS256 dengan pesan tunggal "Invalid token", verifikasi user DB, `req.user` dari DB)
- `src/middleWares/isAdmin.js` (guard role admin 403 "Admin access required")
- Admin routes & controller (`GET /admin/users`, `GET /admin/users/:id`, `DELETE /admin/users/:id`), kolom password & avatar_public_id excluded, proteksi admin delete self, handling id via query prepared statement (404 bila tidak cocok), di-mount di `/admin`
- Rute pengujian sementara telah dibersihkan dari `src/app.js`

Next steps
1. User routes (`GET /users/me`, `PUT /users/me`, dll.)
2. Cloudinary config, `multer` upload middleware, avatar/image endpoint
3. Test everything in Postman

## Testing

Manual testing with Postman:
1. `GET /health` -> 200
2. `POST /auth/register` (user baru dengan body menyertakan `"role":"admin"`) -> 201 (role dipastikan "user", tanpa field password)
3. `POST /auth/register` dengan email sama -> 409
4. `POST /auth/login` (user valid) -> 200 dengan token
5. `POST /auth/login` (password salah) -> 401 "Invalid email or password"
6. `GET /admin/users` tanpa token -> 401
7. `GET /admin/users` token user biasa -> 403
8. `GET /admin/users` token admin -> 200, tanpa password dan tanpa avatar_public_id
9. `GET /admin/users/9999` dan `GET /admin/users/abc` -> keduanya 404
10. `DELETE /admin/users/<id>` dengan token admin -> 200, lalu `GET /admin/users` dengan token lama user terhapus -> 401

## Do not

- Do not add a frontend.
- Do not commit `.env` or hard-code secrets.
- Do not expose password hashes in any endpoint.
- Do not allow users to set their own `role` via register or update.