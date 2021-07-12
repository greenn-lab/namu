module.exports = {
  entry: {
    index: ['./index.js'],
    namu: ['./src/namu.js']
  },
  output: {
    filename: '[name].js'
  },
  mode: 'development',
  devServer: {
    contentBase: './dist'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
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
              implementation: require.resolve('sass'),
            }
          }
        ]
      }
    ]
  }
}
