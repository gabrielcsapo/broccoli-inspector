/* eslint-env node */
'use strict';

module.exports = function (app, info) {
  delete require.cache[require.resolve('../lib/middleware')];

  require('../lib/middleware')(app, info)
};
