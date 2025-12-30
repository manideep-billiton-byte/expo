import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', // Updated base path to root
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
