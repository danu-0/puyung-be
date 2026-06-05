# 🏡 Puyung Serve — Backend API

Backend REST API untuk aplikasi layanan Desa Puyung, dibangun dengan Express.js + Prisma + PostgreSQL (Neon DB).

---

## 🗂️ Struktur Project

```
puyung-serve-backend/
├── prisma/
│   ├── schema.prisma        # Skema database lengkap
│   └── seed.js              # Data awal (admin, harga, tempat, darurat)
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── pengaduan.controller.js
│   │   ├── berita.controller.js
│   │   ├── administrasi.controller.js
│   │   ├── misc.controller.js       # harga, tempat, darurat, pemberitahuan
│   │   └── user.controller.js       # profil, notifikasi, aktivitas
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── pengaduan.routes.js
│   │   ├── berita.routes.js
│   │   ├── darurat.routes.js
│   │   ├── hargaPangan.routes.js
│   │   ├── tempat.routes.js
│   │   ├── administrasi.routes.js
│   │   ├── notifikasi.routes.js
│   │   ├── aktivitas.routes.js
│   │   └── pemberitahuan.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verify, isAdmin, isKepalaDesa
│   │   └── upload.middleware.js     # Multer config
│   ├── db/
│   │   └── prisma.js               # Prisma client singleton
│   ├── utils/
│   │   ├── response.js             # Helper response standar
│   │   └── notification.js         # Helper kirim & broadcast notifikasi
│   └── index.js                    # Entry point
├── uploads/                         # File upload (auto-created)
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Instalasi

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file .env
```bash
cp .env.example .env
```
Isi `DATABASE_URL` dengan connection string dari Neon DB kamu.

### 3. Generate Prisma client
```bash
npx prisma generate
```

### 4. Migrasi database
```bash
npx prisma migrate dev --name init
```

### 5. Seed data awal
```bash
node prisma/seed.js
```

### 6. Jalankan server
```bash
npm run dev
```

---

## 🔐 Autentikasi

Semua endpoint (kecuali register & login) butuh header:
```
Authorization: Bearer <token>
```

| Role         | Akses                          |
|--------------|-------------------------------|
| PENDUDUK     | Fitur user biasa               |
| PENDATANG    | Sama dengan PENDUDUK           |
| OPERATOR     | Dashboard admin desa           |
| KEPALA_DESA  | Akses penuh + admin            |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Akses  | Deskripsi         |
|--------|-----------------------|--------|-------------------|
| POST   | /api/auth/register    | Public | Daftar user baru  |
| POST   | /api/auth/login       | Public | Login             |
| GET    | /api/auth/me          | User   | Data user aktif   |

### Pengaduan
| Method | Endpoint                      | Akses | Deskripsi              |
|--------|-------------------------------|-------|------------------------|
| POST   | /api/pengaduan                | User  | Buat laporan + foto    |
| GET    | /api/pengaduan                | User/Admin | List laporan      |
| GET    | /api/pengaduan/:id            | User/Admin | Detail laporan    |
| PUT    | /api/pengaduan/:id/status     | Admin | Update status laporan  |

### Berita
| Method | Endpoint          | Akses | Deskripsi     |
|--------|-------------------|-------|---------------|
| GET    | /api/berita       | User  | List berita   |
| GET    | /api/berita/:id   | User  | Detail berita |
| POST   | /api/berita       | Admin | Tambah berita |
| PUT    | /api/berita/:id   | Admin | Edit berita   |
| DELETE | /api/berita/:id   | Admin | Hapus berita  |

### Harga Pangan
| Method | Endpoint                  | Akses | Deskripsi       |
|--------|---------------------------|-------|-----------------|
| GET    | /api/harga-pangan         | User  | List harga      |
| POST   | /api/harga-pangan         | Admin | Tambah harga    |
| PUT    | /api/harga-pangan/:id     | Admin | Update harga    |
| DELETE | /api/harga-pangan/:id     | Admin | Hapus harga     |

### Tempat
| Method | Endpoint          | Akses | Deskripsi       |
|--------|-------------------|-------|-----------------|
| GET    | /api/tempat       | User  | List tempat     |
| GET    | /api/tempat/:id   | User  | Detail tempat   |
| POST   | /api/tempat       | Admin | Tambah tempat   |
| PUT    | /api/tempat/:id   | Admin | Edit tempat     |
| DELETE | /api/tempat/:id   | Admin | Hapus tempat    |

### Darurat
| Method | Endpoint              | Akses | Deskripsi              |
|--------|-----------------------|-------|------------------------|
| GET    | /api/darurat          | User  | List kontak darurat    |
| POST   | /api/darurat          | Admin | Tambah kontak          |
| PUT    | /api/darurat/:id      | Admin | Update kontak          |

### Administrasi
| Method | Endpoint                          | Akses | Deskripsi           |
|--------|-----------------------------------|-------|---------------------|
| POST   | /api/administrasi                 | User  | Ajukan dokumen      |
| GET    | /api/administrasi                 | User/Admin | List pengajuan |
| GET    | /api/administrasi/:id             | User/Admin | Detail        |
| PUT    | /api/administrasi/:id/status      | Admin | Update status       |

### Pemberitahuan (Carousel + Notifikasi broadcast)
| Method | Endpoint                  | Akses | Deskripsi               |
|--------|---------------------------|-------|-------------------------|
| GET    | /api/pemberitahuan        | User  | List aktif (carousel)   |
| GET    | /api/pemberitahuan/semua  | Admin | Semua pemberitahuan     |
| POST   | /api/pemberitahuan        | Admin | Buat + broadcast        |
| PUT    | /api/pemberitahuan/:id    | Admin | Edit                    |
| DELETE | /api/pemberitahuan/:id    | Admin | Hapus                   |

### Notifikasi
| Method | Endpoint                      | Akses | Deskripsi               |
|--------|-------------------------------|-------|-------------------------|
| GET    | /api/notifikasi               | User  | List notifikasi         |
| PUT    | /api/notifikasi/:id/baca      | User  | Tandai dibaca           |
| PUT    | /api/notifikasi/baca-semua    | User  | Tandai semua dibaca     |

### Aktivitas
| Method | Endpoint       | Akses | Deskripsi            |
|--------|----------------|-------|----------------------|
| GET    | /api/aktivitas | User  | List aktivitas & status |

### User / Profil
| Method | Endpoint                  | Akses | Deskripsi          |
|--------|---------------------------|-------|--------------------|
| GET    | /api/users/profil         | User  | Lihat profil       |
| PUT    | /api/users/profil         | User  | Update profil      |
| PUT    | /api/users/ganti-password | User  | Ganti password     |
| GET    | /api/users                | Admin | List semua user    |

---

## 📤 Upload File

Form Data key untuk tiap endpoint:
- **Pengaduan** → `foto` (max 5 file, jpg/png)
- **Administrasi** → `dokumen` (max 10 file, jpg/png/pdf)
- **Berita / Tempat / Pemberitahuan** → `foto` (1 file)
- **Profil** → `foto` (1 file)

---

## 🌱 Data Admin Default (setelah seed)

| Role        | Nomor HP      | Password    |
|-------------|---------------|-------------|
| KEPALA_DESA | 081000000001  | admin123    |
| OPERATOR    | 081000000002  | operator123 |

> ⚠️ Ganti password setelah deployment!
