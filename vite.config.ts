import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './' ensures assets are linked relatively, allowing deployment to 
  // https://username.github.io/repo-name/ without hardcoding the repo name.
  base: './',
})