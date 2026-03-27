# AttendEase Setup Guide

## 1. Prerequisites
- Node.js 18+ (tested on Node 25.6)
- MySQL 8+ running locally or remote
- Gemini API key (free at https://aistudio.google.com/apikey)

## 2. Installation

```bash
cd attendease
npm install
```

## 3. Environment Variables
Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/attendance_db"
NEXTAUTH_SECRET="run: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your_key_from_aistudio.google.com"
NEXT_PUBLIC_APP_NAME="AttendEase"
```

## 4. Database Setup

```bash
# Create the database in MySQL first:
mysql -u root -p -e "CREATE DATABASE attendance_db;"

# Push schema
npm run db:push

# Seed demo data
npm run db:seed
```

## 5. Run
```bash
npm run dev
# Visit http://localhost:3000
```

## 6. First Time Setup (Super Admin)
1. Login as `superadmin` / `Admin@2025`
2. Go to **Setup** → fill university name, settings
3. Go to **Departments** → add your departments
4. Go to **HODs** → create HOD accounts
5. Each HOD logs in and:
   - Creates academic year & semesters
   - Adds subjects, assigns teachers
   - Adds students (manually or bulk import)
   - Teachers can now mark attendance!

## 7. AI Features
The AI assistant understands natural language:
- `"Mark Data Structures attendance today. Present: 1,2,3,4. Absent: 5,6"`
- `"Everyone present in OS today except roll 12 and 15"`
- `"Import students: [paste list]"`
- `"Who has less than 75% in BCA?"`

## 8. Production
```bash
npm run build
npm start
```
