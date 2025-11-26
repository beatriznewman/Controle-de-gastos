import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3333',
  },
  reporter: [['list']],
})


