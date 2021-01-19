const path = require('path');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
  // -------------------------
  // -------- SERVER ---------
  // -------------------------
  {
    watch: true,
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
  // --------- BUILD ----------
  // --------------------------
  {
    watch: true,
    entry: {
      build: './src/client/build.ts',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
      publicPath: '../',
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
      }),
    ],
  },
  // --------------------------
  // --------- INDEX ----------
  // --------------------------
  {
    watch: true,
    entry: {
      index: './src/client/index.ts',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
      publicPath: '',
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
        filename: 'index.html',
        template: 'src/client/public/index.html',
      }),
    ],
  },
  // -------------------------
  // -------- STATIC ---------
  // -------------------------
  {
    watch: true,
    target: 'web',
    module: {
      rules: [
        {
          test: /\.(png|svg|jpg|jpeg|gif|ttf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/client/public/images', to: 'images' },
          { from: 'src/client/public/fonts', to: 'fonts' },
        ],
      }),
    ],
  },
  // -------------------------
  // --------- PLAY ----------
  // -------------------------
  {
    watch: true,
    entry: {
      play: './src/client/play.ts',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
      publicPath: '../',
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
          // Loads the javacript into html template provided.
          // Entry point is set below in HtmlWebPackPlugin in Plugins
          test: /\.html$/,
          use: ['html-loader'],
        },
        {
          test: /\.css$/i,
          use: ['file-loader'],
        },
        {
          test: /\.(svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'play.html',
        template: 'src/client/public/play.html',
      }),
    ],
  },
];
