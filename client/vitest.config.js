import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import jsxInJs from 'vite-plugin-jsx-in-js';

export default defineConfig({
  plugins: [
    jsxInJs(),
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    alias: {
      app: path.resolve(__dirname, './app'),
    },
  },
});
