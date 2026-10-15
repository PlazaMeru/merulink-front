import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


const COPYRIGHT_BANNER =
  '/*! MeruLink (c) 2026 Hotel Plaza Meru. Todos los derechos reservados. ' +
  'Uso exclusivo: prohibida su reproducción, distribución o modificación sin autorización previa y por escrito del titular. */';

/**
 * Prepende el aviso de copyright a TODOS los archivos del build (chunks JS y
 * assets CSS) el aviso viaja en cada archivo que se distribuya.
 */
function copyrightBanner(banner) {
  return {
    name: 'copyright-banner',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk') {
          item.code = `${banner}\n${item.code}`;
        } else if (item.fileName.endsWith('.css')) {
          item.source = `${banner}\n${item.source}`;
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyrightBanner(COPYRIGHT_BANNER)],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Necesario en Docker (Windows/WSL2) los eventos de cambio de archivo
    // no siempre llegan por bind mount. Polling garantiza hot reload.
    watch: {
      usePolling: true,
      interval: 500,
    },
    proxy: {
      '/api': {
        target: 'http://backend:80',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://backend:80',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': {}
  }
})
