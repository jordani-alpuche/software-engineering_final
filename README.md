# Gate Management System

This is a **Gate Management System** built with **Next.js 15**, **Prisma ORM**, and **PostgreSQL**. It handles user authentication, visitor scheduling, entry/exit tracking, blacklist handling, and analytics for residents and security personnel.

---

## 🚀 Features

- **NextAuth.js Authentication**
- **Visitor Scheduling (Individual & Group)**
- **Entry & Exit Logs**
- **Blacklist Management**
- **Resident Vehicles Management**
- **Security and Resident Roles**
- **Visitor Feedback**
- **Dashboard Charts**
- Modular components using **Shadcn/UI** and **Tailwind CSS**
- **PostgreSQL** for data storage via **Prisma ORM**

---

## 🏗️ Folder Structure


src/
├── app/         # App router structure with pages and layouts
│   ├── (auth)/login      # Login page
│   ├── (pages)/dashboard   # Main dashboard
│   └── ...             # Other page routes like users, visitors, etc.
├── api/         # Next.js API routes (REST endpoints)
│   ├── auth          # Auth with NextAuth.js
│   ├── users         # User CRUD
│   ├── visitors      # Visitor scheduling, logs, updates
├── components/    # UI components including forms, lists, and loaders
│   └── ui/         # Shadcn UI components
├── services/      # API helper functions
├── utils/         # Utilities like hashing, QR generation
├── middleware.ts  # Middleware (e.g. for authentication)
├── globals.css    # Global styles
└── providers.tsx  # Providers like Theme and Session
Getting Started
📦 Prisma Models
This project includes Prisma models for:

users, login_log, notifications, resident_vehicle

visitiors, visitors_schedule, visitor_entry_logs, visitor_feedback

entry_log, blacklist_visitors

You can find and edit them in the prisma/schema.prisma file.

Prerequisites
Make sure you have the following installed:

Node.js v18 or higher
PostgreSQL v15
npm or yarn
Environment Variables
Create a .env file in the root of your project and add the following:

Code snippet

# Auth secret
NEXTAUTH_SECRET="SuperSecretPasswordSIB"

# PostgreSQL database connection
DATABASE_URL="postgresql://postgres:jalpuche@localhost:5432/software_engineering?schema=public&connection_limit=1"

# App URL
NEXTAUTH_URL="http://localhost:3000"
Getting Started
Install dependencies:

npm install --legacy-peer-deps
Push Prisma schema to your DB:

npx prisma db push
Start the development server:

npm run dev
Access the app at:

http://localhost:3000
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run lint	Run ESLint
npx prisma studio	Open Prisma GUI for DB Browse
```
