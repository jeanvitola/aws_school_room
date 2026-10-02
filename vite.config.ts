import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages publica el sitio en /<repo>/: el workflow de despliegue define BASE_PATH.
  // En desarrollo y en los tests el sitio vive en la raíz.
  base: process.env.BASE_PATH ?? '/',
  server: { port: 5173 },
  preview: { port: 4173 },
});
