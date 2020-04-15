/* eslint-env node */
'use strict';

const walkSync = require('walk-sync');

module.exports = function(app, info) {
  debugger;
  const { watcher, httpServer } = info;

  const io = require('socket.io')(httpServer);

  io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });

    watcher.builder.builder.on('beginNode', (node) => {
      socket.emit('beginNode', node);
    });

    watcher.builder.builder.on('endNode', (node) => {
      const { outputPath } = node;

      node.nodeInfo.outputFiles = walkSync(outputPath);

      socket.emit('endNode', node);
    });
  });

  app.get('/_broccoli/api', (req, res) => {
    console.log(watcher.builder.builder.watchedPaths)
    res.json(watcher.builder.builder.watchedPaths);
  });

  app.get('/_broccoli/*', (req, res) => {
    // serve the static assets for the broccoli-inspector page to load
  });
}
