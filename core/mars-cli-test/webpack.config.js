const path = require('path');

// 支持低版本的node; babel-loader 转译高版本语法
// babel-loader @babel/core @babel/preset-env
// regeneratorRuntime is not defined
// 借助transfor-runtime @babel/plugin-transform-runtime
module.exports = {
  entry: './bin/core.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'core.js'
  },
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|dist)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime',
              {
                corejs: 3,
                regenerator: true,
                useESModules: true,
                helpers: true
              }]
            ]
          }
        }
      }
    ]
  }
};