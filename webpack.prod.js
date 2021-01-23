const path = require('path');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
  // -------------------------
  // -------- SERVER ---------
  // -------------------------
  {
    mode: 'production',
    entry: {
      server: './src/server/index.ts',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
    },
    target: 'node',
    node: {
      // Need this when working with express, otherwise the build fails
      __dirname: false, // if you don't put this is, __dirname
      __filename: false, // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
      rules: [
        {
          // Transpiles ES6-8 into ES5
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
  },
  // --------------------------
  // ---------- WEB -----------
  // --------------------------
  {
    mode: 'development',
    entry: {
      build: './src/client/build.ts',
      play: './src/client/play.ts',
      index: './src/client/index.ts',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
      publicPath: '/',
    },
    target: 'web',
    module: {
      rules: [
        {
          // Transpiles ES6-8 into ES5
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(svg)$/i,
          type: 'asset/resource',
        },
        {
          // Loads the javacript into html template provided.
          // Entry point is set below in HtmlWebPackPlugin in Plugins
          test: /\.html$/,
          use: ['html-loader'],
        },
        {
          test: /\.css$/i,
          use: ['file-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'build.html',
        template: 'src/client/public/build.html',
        chunks: ['build'],
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/client/public/index.html',
        chunks: ['index'],
      }),
      new HtmlWebpackPlugin({
        filename: 'play.html',
        template: 'src/client/public/play.html',
        chunks: ['play'],
      }),
      new CopyPlugin({
        patterns: [
          { from: 'src/client/public/images', to: 'images' },
          { from: 'src/client/public/fonts', to: 'fonts' },
        ],
      }),
    ],
  },
];
