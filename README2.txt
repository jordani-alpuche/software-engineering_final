# Unit Testing - Gate Management System

This folder contains unit tests for the Gate Management System, written using Jest and ts-jest.

## ✅ How to Run Unit Tests

Make sure you have installed all dependencies:

npm install --legacy-peer-deps

Run the unit tests using:
npm test

Or you can run specific tests with:

npx jest /src/__tests__/chose a filename below


### 🔍 Test Files in This Folder

- `blacklistActions.test.ts`
- `createVisitor.test.ts`
- `feedbackActions.test.ts`
- `userActions.test.ts`
- `visitorFlowActions.test.ts`
- `visitorScheduleActions.test.ts`

These test files are located in the `src/__tests__/` folder and test business logic like visitor creation, blacklist handling, and feedback storage.

### 🧪 Tools Used

- Jest (`ts-jest` for TypeScript support)
- `@testing-library/jest-dom` (for React component assertions if needed)
