import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],  // Solo corre pruebas nuevas
    exclude: ['**/*.spec.ts'],        // Ignora Karma/Jasmine
    environment: 'jsdom'
  }
});
