# 📸 CloudSnap - Image Upload System

> A secure, modern, full-stack image management platform built with Next.js, Express, TypeScript, Prisma ORM, PostgreSQL, and Cloud Object Storage.

---

## 🌐 Live Demo

### Frontend

**Vercel:** https://image-upload-system-psi.vercel.app/

### Backend API

**Render:** https://image-upload-system-qcu3.onrender.com

### API Health Check

https://image-upload-system-qcu3.onrender.com/health

---

## 🌟 Overview

**CloudSnap** is a production-ready SaaS image management platform designed for users to securely upload, organize, search, filter, preview, and manage high-resolution cloud media assets. Built with modern full-stack software architecture principles, strict JWT-based authorization, quota management, and cloud object storage integration (Cloudinary / S3).

---

## ✨ Features

* 🔒 **User Authentication & Authorization**: Secure JWT authentication, password hashing with bcrypt, protected route middleware, and strict user-isolated object ownership (IDOR protection).
* ☁️ **Cloud Storage Integration**: Direct cloud image uploading with unique secure storage keys (`users/USER_ID/images/RANDOM_ID.ext`) to prevent path traversal and file collisions.
* 🎨 **Modern SaaS Dashboard**: Real-time storage analytics, progress bars, total images count, today's uploads, and recent upload activity feed.
* 📤 **Drag & Drop Upload Zone**: Multi-file dropzone with instant client-side preview thumbnails, individual upload progress tracking, and allowed extension validation (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5 MB).
* 🛡️ **Double-Layer Validation**: Validation executed synchronously on both Frontend and Backend, rejecting malicious executables (`.exe`, `.js`, `.html`, `.php`, `.pdf`, `.zip`).
* 📊 **Quota Enforcement**: Configurable user storage quota (5 GB default) checked before processing uploads.
* 🖼️ **Responsive Image Gallery**: Clean 4-column desktop, 2-column tablet, 1-column mobile grid layout supporting live search filtering by filename and sorting (Newest, Oldest, Name A-Z, Name Z-A, File Size).
* 🔍 **Interactive Image Viewer**: Full-screen modal with metadata details (MIME type, size, upload timestamp), direct image URL copying, and deletion confirmation dialog.
* 📝 **Audit Logging**: Comprehensive activity tracking for upload, deletion, profile updates, and account termination events.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │                      │
                    │ Dashboard            │
                    │ Upload UI            │
                    │ Image Gallery        │
                    │ Profile & Settings   │
                    └──────────┬───────────┘
                               │
                         REST API (JWT)
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express API (TS)   │
                    │                      │
                    │ Auth & Security      │
                    │ Upload & Validation  │
                    │ Image & Quota Service│
                    │ Audit Logging        │
                    └───────┬───────┬──────┘
                            │       │
                            ▼       ▼
                    ┌──────────┐ ┌──────────────┐
                    │PostgreSQL│ │Cloud Storage │
                    │ Prisma   │ │(Cloudinary/S3)│
                    └──────────┘ └──────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, Vanilla CSS
* **Icons**: Lucide React
* **Notifications**: Sonner

### Backend

* **Runtime**: Node.js & Express
* **Language**: TypeScript
* **ORM**: Prisma ORM
* **Database**: PostgreSQL (Neon / Managed PostgreSQL)
* **Security**: JWT, bcryptjs, Helmet, CORS, Express Rate Limit
* **Storage**: Cloudinary SDK (with local disk fallback for dev)

---

## 🔑 Environment Variables

See `.env.example` for the complete setup template:

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/image_upload_db?schema=public"
JWT_SECRET=super_secret_jwt_access_token_key_change_in_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DEFAULT_STORAGE_LIMIT_BYTES=5368709120
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Local Development

### 1. Prerequisites

* Node.js (v18+)
* npm or pnpm
* PostgreSQL (or Neon DB instance)

### 2. Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000` with the API running on `http://localhost:5000`.

---

## 📑 API Endpoints Specification

### Authentication

* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate user & receive JWT
* `GET /api/auth/me` - Fetch authenticated user profile

### Images

* `POST /api/images/upload` - Upload image file(s) (`multipart/form-data`)
* `GET /api/images` - Query paginated user images (`?page=1&limit=12&search=query&sortBy=newest`)
* `GET /api/images/:id` - Fetch single image metadata
* `DELETE /api/images/:id` - Permanently delete image asset & update storage quota

### Dashboard & Profile

* `GET /api/dashboard/stats` - Fetch storage usage metrics & recent uploads
* `PUT /api/users/profile` - Update display profile details
* `DELETE /api/users/account` - Permanently delete account and all cloud assets

### Health Check

* `GET /health` - Service health status

---

## 📦 Deployment Instructions

### Frontend (Vercel)

1. Import the repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Configure the environment variable:

```env
NEXT_PUBLIC_API_URL=https://image-upload-system-qcu3.onrender.com/api
```

4. Deploy!

### Backend (Render)

1. Create a new Web Service on Render pointing to the repository.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Environment Variables: Populate `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_...`.

### Database (Neon PostgreSQL)

1. Create a free PostgreSQL database on Neon.tech.
2. Copy the database connection URL into `DATABASE_URL`.
3. Execute `npx prisma db push` to push schema tables.

---

## 🔒 Security Audit & Best Practices

* **Strict IDOR Protection**: Verification of user ownership on every single image query and deletion request.
* **Unique Storage Keys**: Filenames sanitized and formatted as randomized crypto hashes to prevent path traversal attacks.
* **MIME & Extension Enforcement**: Server-side binary inspection allowing only valid image formats (`.jpg`, `.jpeg`, `.png`, `.webp`).
* **Storage Cap Enforcement**: Rejects uploads if `storageUsed + uploadSize > storageLimit`.

---

## 📄 License

Distributed under the MIT License.
