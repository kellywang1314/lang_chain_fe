import { appTools, defineConfig } from '@modern-js/app-tools';
import sassPlugin from '@modern-js/plugin-sass';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  tools: {
    devServer: {
      proxy: {
        '/dashscope': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
  },
  plugins: [
    appTools({
      bundler: 'rspack',
    }),
    sassPlugin(),
  ],
});
