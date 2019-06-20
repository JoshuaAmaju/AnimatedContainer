const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, "./src/index.js"),
  output: {
    filename: "[name].[hash].js",
    app: path.resolve(__dirname, "dist")
  },
  devServer: {
    hot: true,
    port: 3000,
    compress: true,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
              presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
      title: 'AnimatedContainer'
      template: path.resolve(__dirname, "./src/index.html"),
  })]
};
