import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'development' ? './' : '/',
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, './src')}/`,
    },
  },
  plugins: [
    vue(),
    vueJsx({}),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    Icons({
      compiler: 'vue3',
      customCollections: {
        app: FileSystemIconLoader('./src/assets/svg-icons'),
      },
    }),
    ElementPlus({
      useSource: true,
    }),
  ],
  server: {
    proxy: {
      '/oneid/': {
        target: 'https://omapi.test.osinfra.cn/',
        secure: false,
        changeOrigin: true,
      },
      '/api/': {
        target: 'https://dsapi.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/query/': {
        target: 'https://dsapi.osinfra.cn/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
