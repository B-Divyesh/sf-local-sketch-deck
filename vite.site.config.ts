import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  publicDir: '../public',
  build: { target: 'es2022', cssCodeSplit: false, emptyOutDir: true }
});
