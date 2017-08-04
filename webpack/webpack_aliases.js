//
// This is the alias File i use in both configs.
//


const path = require('path');
const config = require('../package.json');

const srcPath = (target) => {
  return path.resolve(__dirname, path.join('../', target));
};

module.exports = {
  Src: path.resolve(__dirname, path.join('../', config.srcPaths.base)),
  '@': path.resolve(__dirname, path.join('../', config.srcPaths.base)),
  Modules: path.resolve(__dirname, path.join('../', config.srcPaths.views)),
  Js: path.resolve(__dirname, path.join('../', config.srcPaths.js)),
  Routes: srcPath(`${config.srcPaths.js}views/`),
  Components: srcPath(`${config.srcPaths.js}components/`),
};

