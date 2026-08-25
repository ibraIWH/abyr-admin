import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin runs on 5174 so it never collides with the storefront dev server (5173).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
});
