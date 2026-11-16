import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  // Scan the web entry only; Android assets contain a separate generated bundle.
  optimizeDeps: { entries: ['index.html'] },
  plugins: [react(), viteSingleFile()],
  server: {
    port: 3000,
    open: false,
  },
});
