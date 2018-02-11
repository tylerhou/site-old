let path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "js/bundle.[hash].js",
    path: path.resolve(__dirname, 'static', 'assets'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
        })
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin("css/styles.[hash].css"),
    new ManifestPlugin({
      fileName: "../../data/manifest.json",
    }),
  ]
};
