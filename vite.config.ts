import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // these are the aliases and paths to them
      '@components': path.resolve('./src/components'),
      '@lib': path.resolve('./src/lib'),
      '@utils': path.resolve('./src/lib/utils')
    }
  },
  plugins: [svelte()],
	})
