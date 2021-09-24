module.exports = {
  mode: 'development',
  entry: './src/namu.js',
  output: {
    libraryTarget: 'window',
    filename: 'namu.min.js'
  },
  // devtool: 'cheap-source-map',
  devServer: {
    static: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: 'sass'
            }
          }
        ]
      }
    ]
  }
}
