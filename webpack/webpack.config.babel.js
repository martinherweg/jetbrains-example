/**
 * Webpack Config for Javascript and CSS Bundling
 *
 * @package  generator-mh-boilerplate
 * @author   Martin Herweg <info@martinherweg.de>
 */

import webpack from 'webpack';
import { getIfUtils, removeEmpty } from 'webpack-config-utils';
import path from 'path';
import config from '../package.json';
import Dashboard_plugin from 'webpack-dashboard/plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import Webpack2Polyfill from 'webpack2-polyfill-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import Aliases from './webpack_aliases';


const { ifProduction, ifNotProduction, ifDevelopment, ifNotDevelopment } = getIfUtils(process.env.NODE_ENV);

/*
 |--------------------------------------------------------------------------
 | Setting some paths for our Application
 |--------------------------------------------------------------------------
 */
const BASE_PATH = path.join(path.resolve(__dirname, '../'));
const ASSETS_ROOT = path.resolve(BASE_PATH, config.distPaths.base);



/*
 |--------------------------------------------------------------------------
 | Hot Middleware Client
 |--------------------------------------------------------------------------
 */

const hot_client = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true&overlay=true';


/*
 |--------------------------------------------------------------------------
 | Defining Entry Points, could be used to manually split Parts of the Application, for example
 | Admin Javascript and FrontEnd JavaScript
 |--------------------------------------------------------------------------
 */

const entry_points = {
  app: './src/js/app.js',
};


if (ifDevelopment()) {
  Object.keys(entry_points).forEach(entry => entry_points[entry] = [hot_client].concat(entry_points[entry]));
}

function assetsPath(_path) {
  return path.posix.join('assets/', _path);
}

let chunks = [];


  const chunks_inject = [
      {
        filename: path.resolve(`${config.distPaths.views}_parts/webpack-header.blade.php`),
        file: config.srcPaths.views + '_parts/webpack-header.blade.php',
        inject: false,
      },
      {
        filename: path.resolve(`${config.distPaths.views}_parts/site-scripts.blade.php`),
        file: config.srcPaths.views + '_parts/site-scripts.blade.php',
        inject: false,
      }
    ]


chunks_inject.forEach((chunk) => {
  const plugin = new HtmlWebpackPlugin({
    filename: chunk.filename,
    template: chunk.file,
    inject: chunk.inject,
    minify: false,
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency',
  });

  chunks.push(plugin);
});

const CSS_LOADERS = [
  {
    loader: 'css-loader',
    options: {
      autoprefixer: false,
      sourceMap: true,
      importLoaders: 3,
      url: false,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
    },
  },
];

/*
 |--------------------------------------------------------------------------
 | return webpack config object
 |--------------------------------------------------------------------------
 */

export default {
  // we have to use source map for css source maps, slightly longer compile times
  devtool: 'source-map',
  context: BASE_PATH,
  // entry is a function so that we can use environment variables
  entry: removeEmpty(entry_points),
  output: {
    path: ASSETS_ROOT,
    publicPath: '',
    filename: ifProduction(assetsPath('js/[name].[chunkhash].js'), assetsPath('js/[name].js')),
    chunkFilename: assetsPath('js/[id].[chunkhash].js'),
  },
  resolve: {
    extensions: ['.js','.json', '.vue'],
    modules: [
      resolve(config.srcPaths.base),
      resolve('node_modules'),
    ],
    alias: Aliases,
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        options: {
          formatter: require("eslint-friendly-formatter"),
        },
        enforce: 'pre',
        include: resolve(config.srcPaths.base),
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: resolve(config.srcPaths.base),
      },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
          scss: ifProduction(
            ExtractTextPlugin.extract({
              use: [{ loader: 'css-loader', options: {url: false}}, { loader: 'sass-loader'}],
              fallback: 'vue-style-loader',
            }),
            [{ loader: 'vue-style-loader'}, { loader: 'css-loader', options: {url: false}}, { loader: 'sass-loader'}]
          ),
        },
      },
    },

      {
        test: /\.json$/,
        use: 'json-loader',
      },
    {
      test: /\.css$/,
      use: ifProduction(ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader'],
    }), ['style-loader', 'css-loader']),
    },
    {
      test: /\.scss$/,
      include: resolve(config.srcPaths.css),
      exclude: [resolve('node_modules'), resolve('dist/')],
      use: ifProduction(ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: CSS_LOADERS,
    }), ['style-loader', ...CSS_LOADERS]),
    },
    {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
          name: (path) => {
          console.log(path);
        },
      },
    },
    {
      // Match woff2 in addition to patterns like .woff?v=1.1.1.
      test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
        // Limit at 10k. Above that it emits separate files
        limit: 10000,

          // url-loader sets mimetype if it's passed.
          // Without this it derives it from the file extension
          mimetype: 'application/font-woff',

          // Output below fonts directory
          name: assetsPath('fonts/[name].[ext]'),
      },
    },
    ],
  },
  plugins: removeEmpty([
    new Webpack2Polyfill(),
    new CleanWebpackPlugin([config.distPaths.css, config.distPaths.js], {
      root: BASE_PATH,
      verbose: true,
    }),
    ifProduction(new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: `${BASE_PATH}/webpack/stats.json`,
      logLevel: 'info',
    })),
    ifDevelopment(new Dashboard_plugin({ port: 3002 })),
    ifDevelopment(new webpack.HotModuleReplacementPlugin()),
    ifDevelopment(new webpack.NamedModulesPlugin()),
    ifDevelopment(new webpack.NoEmitOnErrorsPlugin()),
    ifDevelopment(new FriendlyErrorsWebpackPlugin()),
    ifProduction(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    })),
    ifProduction(new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
      },
    })),
    ifProduction(new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      },
    })),
    ifProduction(
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor'],
      }),),
    ifProduction(new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
    ),
    new ExtractTextPlugin({
      filename: ifDevelopment(assetsPath('css/[name].css'), assetsPath('css/[name].[chunkhash].css')),
    }),
    ifProduction(
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
    ),
    new StylelintPlugin({
      context: resolve('src/scss/'),
      syntax: 'scss',
    }),
    ...chunks,
    new WriteFilePlugin({
      log: false,
      test: /^(?!.+(?:hot-update.(js|json))).+$/,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ]),
};

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
