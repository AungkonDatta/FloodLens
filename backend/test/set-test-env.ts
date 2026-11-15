/// <reference types="node" />
// Jest sets NODE_ENV to "test" automatically, but the boilerplate's env
// validation (src/config/app.config.ts) only accepts "development" or "production".
// This file runs before every e2e test file and fixes that.
process.env.NODE_ENV = "development";
export {};