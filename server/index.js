/* eslint-env node */
'use strict';

const { ApolloServer, gql } = require('apollo-server-express');
const walkSync = require('walk-sync');

module.exports = function(app, info) {
  const { watcher, httpServer } = info;

  const io = require('socket.io')(httpServer);

  io.on('connection', function (socket) {
    watcher.builder.builder.on('buildFinished', (pipeline) => {
      socket.emit('buildFinished', pipeline);
    });

    watcher.builder.builder.on('beginNode', (node) => {
      socket.emit('beginNode', node);
    });

    watcher.builder.builder.on('endNode', (node) => {
      socket.emit('endNode', node);
    });
  });

  function getNodeById(id) {
    let node;

    for (const [index, _node] of watcher.builder.builder._nodeWrappers.entries()) {
      if ( _node.id === id ) {
        node = _node;

        break;
      }
    }

    return node;
  }

  const resolvers = {
    Query: {
      nodes() {
        return watcher.builder.builder._nodeWrappers
      },

      node(root,args,context,info) {
        const { id } = args;

        return {
          id: id
        };
      },
    },

    Node: {
      buildState:(root, args, context, info) => {
        const { id } = root;
        const { buildState } = getNodeById(parseInt(id));

        return buildState;
      },

      stats:(root, args, context, info) => {
        const { id } = root;
        const node = getNodeById(parseInt(id));

        const { stats } = node['__heimdall__'];

        return stats
      },

      label:(root, args, context, info) => {
        const { id } = root;
        const { label } = getNodeById(parseInt(id));

        return label;
      },

      slowestNodes:(root, args, context, info) => {
        return Array.from(watcher.builder.builder._nodeWrappers, ([key, value]) => value)
          .sort((pluginA, pluginB) => pluginB.buildState.selfTime - pluginA.buildState.selfTime)
          .slice(0, 5);
      },

      outputFiles:(root, args, context, info) => {
        const { id } = root;
        let outputFiles = [];

        const { outputPath } = getNodeById(parseInt(id));

        return walkSync(outputPath)
      },

      inputFiles:(root, args, context, info) => {
        const { id } = root;
        const { inputPaths } = getNodeById(parseInt(id));

        let inputFiles = inputPaths.map((inputPath) => walkSync(inputPath))

        return [].concat(...inputFiles)
      }
    }
  };

  const server = new ApolloServer({ resolvers, typeDefs: gql`
    type Query {
      nodes: [Node]
      node(id:ID!):Node
    }

    type Node {
      id: ID!
      label: String
      buildState: BuildState
      stats: Stat
      slowestNodes: [Node]
      inputFiles: [String]
      outputFiles: [String]
    }

    type BuildState {
      selfTime: Float!
      totalTime: Float!
    }

    type Stat {
      fs: FS
    }

    type FS {
      appendFile: FSMetric
      appendFileSync: FSMetric
      access: FSMetric
      accessSync: FSMetric
      chown: FSMetric
      chownSync: FSMetric
      chmod: FSMetric
      chmodSync: FSMetric
      close: FSMetric
      closeSync: FSMetric
      copyFile: FSMetric
      copyFileSync: FSMetric
      createReadStream: FSMetric
      createWriteStream: FSMetric
      exists: FSMetric
      existsSync: FSMetric
      fchown: FSMetric
      fchownSync: FSMetric
      fchmod: FSMetric
      fchmodSync: FSMetric
      fdatasync: FSMetric
      fdatasyncSync: FSMetric
      fstat: FSMetric
      fstatSync: FSMetric
      fsync: FSMetric
      fsyncSync: FSMetric
      ftruncate: FSMetric
      ftruncateSync: FSMetric
      futimes: FSMetric
      futimesSync: FSMetric
      lchown: FSMetric
      lchownSync: FSMetric
      lchmod: FSMetric
      lchmodSync: FSMetric
      link: FSMetric
      linkSync: FSMetric
      lstat: FSMetric
      lstatSync: FSMetric
      mkdir: FSMetric
      mkdirSync: FSMetric
      mkdtemp: FSMetric
      mkdtempSync: FSMetric
      open: FSMetric
      openSync: FSMetric
      opendir: FSMetric
      opendirSync: FSMetric
      readdir: FSMetric
      readdirSync: FSMetric
      read: FSMetric
      readSync: FSMetric
      readFile: FSMetric
      readFileSync: FSMetric
      readlink: FSMetric
      readlinkSync: FSMetric
      realpath: FSMetric
      realpathSync: FSMetric
      rename: FSMetric
      renameSync: FSMetric
      rmdir: FSMetric
      rmdirSync: FSMetric
      stat: FSMetric
      statSync: FSMetric
      symlink: FSMetric
      symlinkSync: FSMetric
      truncate: FSMetric
      truncateSync: FSMetric
      unwatchFile: FSMetric
      unlink: FSMetric
      unlinkSync: FSMetric
      utimes: FSMetric
      utimesSync: FSMetric
      watch: FSMetric
      watchFile: FSMetric
      writeFile: FSMetric
      writeFileSync: FSMetric
      write: FSMetric
      writeSync: FSMetric
      writev: FSMetric
      writevSync: FSMetric
    }

    type FSMetric {
      count: Float
      time: Float
    }

    schema {
      query: Query
    }
  ` });

  server.applyMiddleware({ app, path: '/_broccoli/api/graphql' });
}
