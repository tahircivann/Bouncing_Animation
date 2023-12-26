const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  entry: './index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './assets/index.html', // Path to your HTML file
      filename: 'index.html', // Name of the output HTML file
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};