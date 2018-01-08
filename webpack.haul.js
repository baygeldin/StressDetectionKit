module.exports = ({ platform }, { module, resolve }) => ({
  entry: `./src/index.ts`,
  module: {
    ...module,
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader'
          },
        ],
      },
      ...module.rules
    ]
  },
  resolve: {
    ...resolve,
    extensions: [
      '.ts',
      '.tsx',
      `.${platform}.ts`,
      '.native.ts',
      `.${platform}.tsx`,
      '.native.tsx',
      ...resolve.extensions
    ]
  }
})
