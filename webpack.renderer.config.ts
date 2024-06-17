import type { Configuration } from 'webpack';
import webpack from "webpack";

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
}, {
  test: /\.(scss)$/,
  use: [
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader',
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: function () {
            return [
              require('autoprefixer')
            ];
          }
        }
      }
    },
    {
      loader: 'sass-loader'
    }
  ]
}, {
  test: /\.(png|jpe?g|gif|ico|svg)$/,
  use: [
    {
      loader: "file-loader",
    }
  ]
}, {
  test: /\.html$/,
  use: [{
    loader: "html-loader"
  }]
});

plugins.push(new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
}))


export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html'],
  },
};
