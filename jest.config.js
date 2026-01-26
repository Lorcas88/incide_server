export default {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  transform: {}, // Disable transformation for ESM support
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
