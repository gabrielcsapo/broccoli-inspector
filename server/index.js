/* eslint-env node */
'use strict';

const walkSync = require('walk-sync');

module.exports = function(app, info) {
  debugger;
  const { watcher, httpServer } = info;

  const io = require('socket.io')(httpServer);

  io.on('connection', function (socket) {
    watcher.builder.builder.on('beginNode', (node) => {
      socket.emit('beginNode', node);
    });

    watcher.builder.builder.on('endNode', (node) => {
      const { outputPath } = node;

      const serializedNode = {
        id: node.id,
        buildState: node.buildState,
        label: node.label,
        inputPaths: node.inputPaths,
        outputFiles: walkSync(outputPath)
      }

      if(Array.isArray(node.inputPaths)) {
        const inputFile = node.inputPaths.map((inputPath) => walkSync(inputPath))

         serializedNode.inputFiles = [].concat(...inputFile);
      }

      socket.emit('endNode', serializedNode);
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
