import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 为了po到仓库里后加的
  // base: '/livseg2/',
  // build: {
  //   outDir: 'docs'
  // },
  // 为了po到仓库里后加的

  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@cornerstonejs/nifti-image-loader': '@cornerstonejs/nifti-image-loader/dist/cornerstoneNIFTIImageLoader.js',
      '@cornerstonejs/dicom-image-loader': '@cornerstonejs/dicom-image-loader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
});
