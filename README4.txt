# Data Collection / Setup Scripts – Gate Management System

This folder contains utility scripts related to user management and setup for the Gate Management System.

## 📁 Available Script

### `createUser.ts`

- **Path:** `/src/app/utils/createUser.ts`
- **Purpose:** This script creates an initial admin user in the PostgreSQL database. It can be used to set up a user for logging into the system during development or testing.

- **Details:**
  - Uses Prisma ORM to insert a new user.
  - Password is hashed securely before storing.
  - Creates a user with:
    - Username: `myusername`
    - Password: `mypassword` (hashed)
    - Role: `admin`
    - Status: `active`

## ▶️ How to Run

To run the script, ensure your environment variables (e.g., `DATABASE_URL`) are properly configured, then execute:
npx tsx src/app/utils/createUser.ts



This will connect to your database and create the admin user.

## ⚠️ Notes

- This script is currently the only one available and serves as an initial setup script rather than a full data collection utility.
- Additional data collection or export scripts may be added in the future as the project evolves.

---

> 📌 This README is submitted as part of the project requirement for documenting data collection/setup procedures.
