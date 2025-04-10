// jest.config.ts
module.exports = {
  // Use ts-jest preset to handle TypeScript
  preset: "ts-jest",

  // Environment (node for backend/API tests, jsdom for React component tests)
  testEnvironment: "node", // Or 'jsdom' if testing React components

  // --- Coverage Configuration ---
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: "coverage", // Folder where reports are saved
  coverageProvider: "v8", // Use V8's built-in coverage (faster, usually good for TS)

  // Specify the reporters (matches your nyc requirement)
  coverageReporters: ["html", "text", "text-summary"], // Added text-summary for console output

  // Define which files should be included in coverage report
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}", // Include all TS/TSX files in src
    "!src/**/*.d.ts", // Exclude type definition files
    "!src/**/*.test.{ts,tsx}", // Exclude test files themselves
    "!src/app/api/auth/[...nextauth]/route.ts", // Example: Exclude auth route if needed
    "!src/lib/auth.ts", // Example: Exclude auth options if needed
    // Add any other files/patterns to exclude (e.g., constants, types)
  ],
  // -----------------------------

  // Add module name mapper if you use path aliases like @/*
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Configure test result reporters (for JUnit XML)
  reporters: [
    "default", // Keep the default console output
    ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }],
  ],

  // ... any other Jest options you might need
};
