import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    ViteImageOptimizer({

    })
  ],
  ssgOptions: {
    crittersOptions: {
      
    },
  },
})
