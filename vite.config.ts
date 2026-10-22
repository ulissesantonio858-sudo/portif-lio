import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Duas páginas: o portfólio e a política de privacidade.
      input: { main: 'index.html', privacidade: 'privacidade.html' },
    },
  },
})
