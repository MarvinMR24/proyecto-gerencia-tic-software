import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Dos páginas: el sitio principal y el panel de monitoreo que se abre en otra pestaña.
      input: {
        main: 'index.html',
        monitoreo: 'monitoreo.html',
      },
    },
  },
})
