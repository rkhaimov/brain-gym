import { Configuration } from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import path from 'path';

const config: Configuration = {
  mode: 'development',
  entry: './src/visualize',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'bundled'),
  },
  plugins: [new HtmlPlugin()],
};

export default config;
