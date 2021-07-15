const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const prod = process.env.NODE_ENV === 'production';

const PATH = {
  SRC: path.resolve(__dirname, './src'),
};

function publicPathResolver(resourcePath, context) {
  const relativePath = path.relative(path.dirname(resourcePath), context);
  const posixPath = relativePath.split(path.win32.sep).join(path.posix.sep);
  return posixPath + '/';
}

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.ts',
  },
  module: {
    rules: [
      {
        test: /\.(ts)?$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(scss)?$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader'
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    port: 9009,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "node_modules/pdfjs-dist/build/pdf.worker.min.js", to: "." },
      ],
      options: {
        concurrency: 100,
      },
    }),
    new CleanWebpackPlugin({
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
    new MiniCssExtractPlugin({
      filename: './styles/[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: 'src/index.html',
    }),
  ],
  output: {
    library: 'SimplePdfAnalyzer',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './docs'),
    filename: 'simple-pdf-analyzer.min.js'
  },
  devtool: 'eval-cheap-source-map',
  target: ['web', 'es5'],
  ...prod ? {
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },
  } : {},
};