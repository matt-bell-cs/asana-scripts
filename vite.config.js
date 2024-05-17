import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'url'
import { resolve } from 'path'

export default ({ mode }) => {
  return defineConfig({
    server: {
      port: 3334,
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('./dist', import.meta.url)),
        },
        {
          find: '@lib',
          replacement: fileURLToPath(new URL('./src/lib', import.meta.url)),
        },
      ],
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/lib/index.ts'),
        fileName: 'index',
        formats: ['es'],
      },
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
  })
}
