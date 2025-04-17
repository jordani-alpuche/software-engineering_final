# Integration Testing - Gate Management System

This folder contains the same test files used in unit testing, but they also act as integration tests, ensuring modules interact correctly with the database.

## 🔧 Integration Testing Setup

These tests uses mock data located inside of each tests.

To run the tests:
npm test


### 🔁 Integration Test Scope

- Full visitor flow from scheduling to entry/exit and feedback.
- Blacklist interactions and validation.
- User and role creation through Prisma.
