let path = require("path");
let MiniCssExtractPlugin = require("mini-css-extract-plugin");
let ManifestPlugin = require("webpack-manifest-plugin");

module.exports = (env, argv) => ({
  entry: "./src/index.js",
  output: {
    filename: "js/bundle.[hash].js",
    path: path.resolve(__dirname, "static", "assets")
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin("css/styles.[hash].css"),
    new ManifestPlugin({
      fileName: "../../data/manifest.json"
    })
  ],
  mode: argv.mode
});
