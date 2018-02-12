const path = require('path');

module.exports = ({ platform }, defaults) => ({
  entry: `./src/index.ts`,
  module: {
    ...defaults.module,
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
          }
        ]
      },
      ...defaults.module.rules
    ]
  },
  resolve: {
    ...defaults.resolve,
    extensions: [
      '.ts',
      '.tsx',
      `.${platform}.ts`,
      '.native.ts',
      `.${platform}.tsx`,
      '.native.tsx',
      ...defaults.resolve.extensions
    ],
    alias: {
      ...defaults.resolve.alias,
      DeviceKit: path.resolve(__dirname, 'src/device-kit.ts')
    }
  },
  plugins: [
    ...defaults.plugins
  ]
});
