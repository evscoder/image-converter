const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node20',
  externalsPresets: {
    node: true,
  },
  externals: [
    ({ request }, callback) => {
      if (request && !request.startsWith('.') && !path.isAbsolute(request)) {
        return callback(null, `commonjs ${request}`);
      }

      return callback();
    },
  ],
  entry: './src/server.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.cjs',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  stats: 'errors-warnings',
  infrastructureLogging: {
    level: 'error',
  },
  devtool: 'source-map',
};
