/**
 * vite.config.js
 * ============================================================
 * Configuración base de Vite para Athena Core (React + JSX).
 * Puerto de desarrollo fijo y variables de entorno con prefijo
 * VITE_ expuestas automáticamente al cliente (import.meta.env).
 * ============================================================
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    // Si tu sistema real corre en otro origen y no configuras CORS
    // en tu backend, puedes descomentar este proxy para desarrollo:
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3000",
    //     changeOrigin: true,
    //   },
    // },
  },

  preview: {
    port: 4173,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
