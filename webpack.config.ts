import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackTagsPlugin from 'html-webpack-tags-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  /**
   * Указываем сборщику ссылку на глобальную переменную, где ключ это путь import,
   * а значение - имя глобальной переменной.
   */
  externals: {
    ggis: 'GGIS',
  },
  plugins: [
    /**
     * CopyWebpackPlugin здесь используется лишь как средство для обслуживания файла через webpack-dev-server.
     */
    new CopyWebpackPlugin({ patterns: [path.join(__dirname, './libs/ggis/dist')] }),
    new HtmlWebpackPlugin(),
    /**
     * Добавляем отдельный скрипт по указанному пути. Так как файл хранится локально, то и путь относительный (от publicPath).
     * Можно указать абсолютный, например сразу до сервера (например https://unpkg.com/react@18/umd/react.development.js)
     */
    new HtmlWebpackTagsPlugin({ tags: ['ggis.js'], append: false }),
  ],
};

export default config;
