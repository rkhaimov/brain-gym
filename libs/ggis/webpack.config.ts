/**
 * В build скрипте выполняется сборка основного бандла и отдельная генерация типов библиотеки.
 * Сгенерированные d.ts файлы могут ссылаться на внешние зависимости, которые не являются частью бандла. Их можно установить отдельно,
 * как это происходит в стандартных библиотеках (например npm i -D @types/react).
 */
import path from 'node:path';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: './src/ggis.ts',
  mode: 'development',
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
    /**
     * library свойство принимает название глобальной переменной, в которую будет записан публичный интерфейс библиотеки.
     * Должен совпадать с externals клиента.
     */
    library: 'GGIS',
    filename: 'ggis.js',
  },
};

export default config;
