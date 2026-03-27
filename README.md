# AttendEase 🎓
> AI-Powered University Attendance Management System

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your DB credentials, Gemini API key, NextAuth secret
# In MySQL: CREATE DATABASE attendance_db;
npm run db:push
npm run db:seed
npm run dev
```

## Demo Logins
| Role | Username | Password |
|------|----------|----------|
| Super Admin | superadmin | Admin@2025 |
| HOD (BCA) | hod_bca | Hod@1234 |
| Teacher | teacher_bca | Teacher@1234 |

## Get API Keys
- **Gemini (free):** https://aistudio.google.com/apikey
- **NextAuth secret:** `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Stack
- Next.js 14 (App Router) · MySQL · Prisma ORM
- Tailwind CSS · NextAuth · Recharts
- Gemini 2.0 Flash (AI features)

## Features
- ✅ Role-based access (Super Admin / HOD / Teacher)
- 🤖 AI attendance via natural language
- 📊 Reports & defaulter detection
- 📥 Bulk student import with AI parsing
- 📅 Academic calendar & holidays
- 🔔 Real-time shortage alerts
- 🔒 Attendance locking after N days
