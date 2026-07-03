# 31. API Specification - REST Endpoints

## Base URL
`https://api.mubtadiaat.id/api` (atau `http://localhost:8788/api` untuk lokal)

## Auth Endpoints (Better-Auth)
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-out`

## Core Resource Endpoints
- `GET /api/dashboard/summary` - Mengambil data ringkasan harian
- `GET /api/attendance/class/:classId` - Mengambil absensi kelas
- `POST /api/attendance/submit` - Menyimpan absensi santri
- `GET /api/grades/report/:santriId` - Mengambil data E-Raport santri
