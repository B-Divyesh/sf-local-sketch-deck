import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('./site/', import.meta.url));
const siteOut = fileURLToPath(new URL('./dist/site/', import.meta.url));

export default defineConfig({
  root: siteRoot,
  publicDir: fileURLToPath(new URL('./public/', import.meta.url)),
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: siteOut,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./site/index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./site/privacy.html', import.meta.url)),
        terms: fileURLToPath(new URL('./site/terms.html', import.meta.url))
      }
    }
  }
});
