/* eslint-env node */
'use strict';

module.exports = function (app, info) {
  require('../lib/middleware')(app, info)
};
