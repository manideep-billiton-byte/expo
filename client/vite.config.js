import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        base: '/',
        plugins: isDev ? [react(), basicSsl()] : [react()],
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
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom']
                    }
                }
            }
        }
    }
})
