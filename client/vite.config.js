import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', // Updated base path to root
    plugins: [react(), basicSsl()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        https: true, // Enable HTTPS for camera access on mobile
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
