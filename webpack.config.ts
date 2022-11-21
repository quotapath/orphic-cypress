import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import path from "path";
import webpack from "webpack";
import {
  transformIsolatedComponentFiles,
  useIsolatedComponentFiles,
} from "./src";

module.exports = {
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      stories: path.resolve(__dirname, "stories"),
      modulesDirectories: ["node_modules"],
    },
    extensions: [".tsx", ".ts", ".js", ".json"],
    symlinks: false,
    fallback: {
      stream: false,
      path: false,
      crypto: false,
      fs: false,
    },
  },
  cache: {
    buildDependencies: {
      config: [__filename],
    },
    type: "filesystem",
  },
  devtool: "eval-cheap-module-source-map",
  devServer: {
    allowedHosts: "all",
    open: false,
    host: "0.0.0.0",
    hot: true,
    port: 3001,
    historyApiFallback: true,
    client: {
      webSocketURL: "ws://0.0.0.0:80/ws",
    },
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true,
              transpileOnly: true,
              ...(useIsolatedComponentFiles && {
                getCustomTransformers: () => ({
                  before: [transformIsolatedComponentFiles("src")],
                }),
              }),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        configFile: "tsconfig.json",
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new webpack.ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      process: "process/browser",
    }),
  ],
  target: "web",
};