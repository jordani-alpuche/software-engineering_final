# Integration Testing - Gate Management System

This folder contains the same test files used in unit testing, but they also act as integration tests, ensuring modules interact correctly with the database.

## 🔧 Integration Testing Setup

These tests use your actual PostgreSQL database (check `.env` file). You may want to set up a separate test database to avoid overwriting production data.

**Verify your `.env` is properly configured properly with the below:**


# Auth secret

NEXTAUTH_SECRET="Your Password"

# PostgreSQL database connection

DATABASE_URL="postgresql://username:password@localhost:5432/software_engineering?schema=public&connection_limit=1"

# App URL

NEXTAUTH_URL="http://localhost:3000"


Push schema (if needed):
npx prisma db push


Then run the tests:
npm test


### 🔁 Integration Test Scope

- Full visitor flow from scheduling to entry/exit and feedback.
- Blacklist interactions and validation.
- User and role creation through Prisma.
