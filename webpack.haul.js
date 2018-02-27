const path = require('path');
const webpack = require('webpack');

module.exports = ({ platform }, defaults) => {
  let definePluginId = defaults.plugins.findIndex(
    p => p.constructor.name === 'DefinePlugin'
  );

  defaults.plugins[definePluginId].definitions['process.env'][
    'MEDM_DEVICEKIT_LICENSE_KEY'
  ] = JSON.stringify(process.env.MEDM_DEVICEKIT_LICENSE_KEY);

  return {
    entry: `./src/index.ts`,
    module: {
      ...defaults.module,
      rules: [
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
        stores: path.resolve(__dirname, 'src/stores/')
      }
    }
  };
};
