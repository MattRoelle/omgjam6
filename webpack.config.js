const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./"
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.txt$/i,
        use: "raw-loader"
      }
    ]
  },
  resolve: {
    alias: { vue: "vue/dist/vue.esm.js" }
  }
};
