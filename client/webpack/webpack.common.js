const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CURRENT_WORKING_DIR = process.cwd();

module.exports = {
  entry: [path.join(CURRENT_WORKING_DIR, 'app/index.js')],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css', '.scss', '.html'],
    alias: {
      app: 'app',
      'lucide-react/dist/cjs/lucide-react.cjs': path.resolve(CURRENT_WORKING_DIR, 'node_modules/lucide-react/dist/cjs/lucide-react.cjs')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          filter: (resourcePath) => {
            if (resourcePath.endsWith('index.html')) {
              return false;
            }
            return true;
          }
        }
      ]
    })
  ]
};
