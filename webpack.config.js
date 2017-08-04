//
// This is the config I add to Storm to recognize the aliases
//

const path = require('path');
const config = require('./package.json');
const aliases = require('./webpack/webpack_aliases');

module.exports = {
  resolve: {
    alias: aliases,
  },
};
