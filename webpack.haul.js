const path = require('path');

module.exports = ({ platform }, defaults) => {
  return {
    entry: `./src/index.ts`,
    module: {
      ...defaults.module,
      rules: [
        {
          test: /\.jsx?$/,
          include: [/node_modules\/native-base-shoutem-theme/],
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        },
        {
          test: /\.tsx?$/,
          exclude: '/node_modules/',
          use: [
            {
              loader: 'babel-loader'
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
        lib: path.resolve(__dirname, 'src/lib/'),
        screens: path.resolve(__dirname, 'src/screens/'),
        stores: path.resolve(__dirname, 'src/stores/'),
        components: path.resolve(__dirname, 'src/components/')
      }
    }
  };
};
