# frontend

This template should help get you started developing with Vue 3 in Vite.

## Project Setup

```sh
npm install
```

### Fix vite problem
1. Find the file node_modules/@cornerstonejs/dicom-image-loader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js
2. Locate the line with string "index.worker"
3. Change the code from "r.p" to "http://localhost:5173/node_modules/@cornerstonejs/dicom-image-loader/dist/dynamic-import/" 

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
