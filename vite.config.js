import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this project under its case-sensitive repository name.
  base: '/Study-Helper/',
  // Use React's automatic JSX runtime; App.jsx uses named React imports only.
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
