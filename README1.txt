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

```

src
├── .github               # GitHub specific configurations
│   └── workflows        # CI/CD workflows
│       └── test.yml     # GitHub Actions workflow for testing
├── app                   # Next.js application directory
│   │
│   ├── (auth)            # Authentication related pages (Route Group)
│   │   └── login         # Login page
│   │       ├── page.js   # Login page component
│   │       ├── page.js.map
│   │       └── page_client-reference-manifest.js
│   │
│   ├── (dashboard)       # Dashboard pages (Route Group)
│   │   └── dashboard     # Main dashboard
│   │       ├── page.js   # Dashboard component
│   │       ├── page.js.map
│   │       └── page_client-reference-manifest.js
│   │
│   ├── (pages)           # Additional pages (Route Group)
│   │   ├── blacklist     # Blacklisting functionality
│   │   │   ├── blacklistvisitor/
│   │   │   ├── createblacklistuser/
│   │   │   ├── createblacklistvisitor/
│   │   │   ├── listblacklistuser/
│   │   │   └── listblacklistvisitor/
│   │   ├── createUser/   # User creation page
│   │   ├── dashboard/    # Another dashboard page
│   │   ├── feedback/     # Feedback functionality
│   │   │   ├── createfeedback/
│   │   │   ├── listfeedback/
│   │   │   └── visitorfeedback/[id]/ # Dynamic route for visitor feedback
│   │   ├── scan/         # Scanning functionality
│   │   ├── usercreation/ # User creation page
│   │   ├── users/        # User management
│   │   │   ├── createuser/
│   │   │   ├── createusers/
│   │   │   ├── listuser/
│   │   │   ├── listusers/
│   │   │   └── updateuser/[id]/ # Dynamic route for user update
│   │   └── visitors/     # Visitor management
│   │       ├── listVisitors/
│   │       ├── newGroupVisitor/
│   │       ├── newIndividualVisitor/
│   │       ├── newvisitor/
│   │       ├── updatevisitor/[id]/ # Dynamic route for visitor update
│   │       ├── viewvisitor/[id]/   # Dynamic route for viewing visitor
│   │       └── vistorlog/
│   │
│   └── api               # API routes
│       ├── accesspoint/
│       │   └── list/     # API to list access points
│       └── auth/
│           └── [...nextauth]/ # NextAuth.js API route (for authentication)
│
└── lib                 # Libraries and utilities
├── auth.ts         # Authentication logic
├── prisma.ts       # Prisma database client
└── utils.ts        # Utility functions

```

```
Getting Started

📦 Prisma Models
This project includes Prisma models for:

users, login_log, notifications, resident_vehicle

visitiors, visitors_schedule, visitor_entry_logs, visitor_feedback

entry_log, blacklist_visitors
```

```
Prerequisites
Make sure you have the following installed:

Node.js v18 or higher
PostgreSQL v15
npm or yarn
Environment Variables
```

Create a .env file in the root of your project and add the following:

# Auth secret

NEXTAUTH_SECRET="Your Password"

# PostgreSQL database connection

DATABASE_URL="postgresql://username:password@localhost:5432/software_engineering?schema=public&connection_limit=1"

# App URL

NEXTAUTH_URL="http://localhost:3000"

```

# Install tsx to be able to run typescript files

npm i tsx --legacy-peer-deps

# Create user

Edit /src/app/utils/createUser.ts with your required parameter

After run npx tsx /src/app/utils/createUser.ts it will create the user in the Database

Getting Started
Install dependencies:

npm install --legacy-peer-deps

Push Prisma schema to your DB:
npx prisma db push

Start the development server:
npm run dev

Access the app at:
http://localhost:3000

```

```
# Run Tests

To run the tests use npm test

```
