require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');

const CURRENT_WORKING_DIR = process.cwd();
const NODE_ENV = process.env.NODE_ENV;
const API_URL = process.env.API_URL;

const config = {
  mode: 'production',
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: 'js/[name].[contenthash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: {
                filter: (url) => {
                  if (url.startsWith('/')) {
                    return false;
                  }
                  return true;
                }
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[contenthash][ext]',
          publicPath: '../images/'
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash][ext]',
          publicPath: '../fonts/'
        }
      }
    ]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    concatenateModules: true,
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        styles: {
          test: /\.css$/,
          name: 'styles',
          chunks: 'all',
          enforce: true
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            comparisons: false
          },
          parse: {},
          mangle: true,
          output: {
            comments: false,
            ascii_only: true
          }
        }
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        API_URL: JSON.stringify(API_URL),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        TURNSTILE_SITE_KEY: JSON.stringify(process.env.TURNSTILE_SITE_KEY),
        HCAPTCHA_SITE_KEY: JSON.stringify(process.env.HCAPTCHA_SITE_KEY)
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(CURRENT_WORKING_DIR, 'public/index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new WebpackPwaManifest({
      name: 'CARTZA',
      short_name: 'Cartza',
      description: 'CARTZA!',
      background_color: '#fff',
      theme_color: '#4a68aa',
      inject: true,
      ios: true,
      icons: [
        {
          src: path.resolve('public/images/pwa.png'),
          destination: 'images',
          sizes: [72, 96, 128, 144, 192, 384, 512]
        },
        {
          src: path.resolve('public/images/pwa.png'),
          sizes: [120, 152, 167, 180],
          destination: 'images',
          ios: true
        }
      ]
    })
  ]
};

module.exports = merge(common, config);
