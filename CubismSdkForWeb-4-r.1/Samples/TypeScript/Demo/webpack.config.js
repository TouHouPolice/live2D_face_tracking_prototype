var path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: { main: "./src/main.ts", index: "./src/index.js" },
  plugins: [new CleanWebpackPlugin()],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/dist/"
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@framework": path.resolve(__dirname, "../../../Framework/src")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, "../../.."),
    watchContentBase: true,
    inline: true,
    hot: true,
    port: 5000,
    host: "localhost",
    compress: true,
    useLocalIp: true,
    writeToDisk: true
  },
  devtool: "inline-source-map"
};
