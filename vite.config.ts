import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // GitHub Pages（https://<ユーザー名>.github.io/<リポジトリ名>/）のようにサブパスで公開しても
    // 動くよう、相対パスで出力する（リポジトリ名が変わっても設定し直さなくてよい）
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
