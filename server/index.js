/* eslint-env node */
'use strict';

const { ApolloServer, gql } = require('apollo-server-express');
const walkSync = require('walk-sync');

module.exports = function (app, info) {
  const { watcher, httpServer } = info;

  const io = require('socket.io')(httpServer);

  io.on('connection', function (socket) {
    watcher.on('buildSuccess', (node) => {
      socket.emit('buildFinished', node);
    });

    watcher.builder.builder.on('beginNode', (node) => {
      socket.emit('beginNode', node);
    });

    watcher.builder.builder.on('endNode', (node) => {
      socket.emit('endNode', node);
    });
  });

  function fuzzySearchNodeWrappers(nodeWrappers, query) {
    const found = [];

    for (const [
      index,
      _node,
    ] of watcher.builder.builder._nodeWrappers.entries()) {
      for (const prop in _node) {
        if (typeof _node[prop] === 'object') {
          // TODO: this should be able to fuzzy search recursively
          continue;
        }
        if (query.exec(_node[prop])) {
          found.push({ id: _node.id });
          // we want to short circuit as we found the prop that matched
          break;
        }
      }
    }

    return found;
  }

  function getNodeById(id) {
    let node;

    for (const [
      index,
      _node,
    ] of watcher.builder.builder._nodeWrappers.entries()) {
      if (_node.id === parseInt(id)) {
        node = _node;

        break;
      }
    }

    return node;
  }

  const resolvers = {
    Query: {
      nodesByType(root, args, context, info) {
        const { type } = args;

        const nodesByType = {};
        for (const [
          index,
          _node,
        ] of watcher.builder.builder._nodeWrappers.entries()) {
          const { id: heimdallId } = _node['__heimdall__'];
          const { broccoliPluginName } = heimdallId;

          if(type && type !== broccoliPluginName) continue;

          if(!nodesByType[broccoliPluginName]) {
            nodesByType[broccoliPluginName] = [];
          }

          nodesByType[broccoliPluginName].push(_node);
        }

        return Object.keys(nodesByType).map((type) => {
          return {
            label: type,
            time: nodesByType[type].map((node) => node.buildState.selfTime).reduce((a, b) => a + b),
            nodes: nodesByType[type]
          }
        });
      },

      fuzzy(root, args, context, info) {
        const { value } = args;

        // we want to fuzzy search all nodes for values that match our value
        return fuzzySearchNodeWrappers(
          watcher.builder.builder._nodeWrappers,
          new RegExp(value)
        );
      },

      nodes() {
        const ids = [];

        // only return the id as we don't want to unnecessarily make the graphql engine trim values
        for (const [
          index,
          _node,
        ] of watcher.builder.builder._nodeWrappers.entries()) {
          ids.push({ id: _node.id });
        }

        return ids;
      },

      node(root, args, context, info) {
        const { id } = args;

        return {
          id: id,
        };
      },
    },

    Node: {
      buildState: (root, args, context, info) => {
        const { id } = root;
        const { buildState } = getNodeById(id);

        return buildState;
      },

      stats: (root, args, context, info) => {
        const { id } = root;
        const node = getNodeById(id);

        let { stats } = node['__heimdall__'];

        if(node['__heimdall__']._children) {
          // Traverse this until we get to a node that is the applyPatches
          for(const child of node['__heimdall__']._children) {
            if(child.id.name === 'applyPatches') {
              return child.stats;
            }
          }
        }

        return stats;
      },

      inputNodeWrappers: (root, args, context, info) => {
        const { id } = root;
        const { inputNodeWrappers=[] } = getNodeById(id);

        return inputNodeWrappers.map(({ id }) => {
          return { id }
        });
      },

      pluginName: (root, args, context, info) => {
        const { id } = root;
        const node = getNodeById(id);

        const { id: heimdallId } = node['__heimdall__'];
        const { broccoliPluginName } = heimdallId;

        return broccoliPluginName;
      },

      label: (root, args, context, info) => {
        const { id } = root;
        const { label } = getNodeById(id);

        return label;
      },

      inputPaths: (root, args, context, info) => {
        const { id } = root;
        const { inputPaths } = getNodeById(id);

        return inputPaths;
      },

      outputPath: (root, args, context, info) => {
        const { id } = root;
        const { outputPath } = getNodeById(id);

        return outputPath;
      },

      slowestNodes: (root, args, context, info) => {
        return Array.from(
          watcher.builder.builder._nodeWrappers,
          ([key, value]) => value
        )
          .sort(
            (pluginA, pluginB) =>
              pluginB.buildState.selfTime - pluginA.buildState.selfTime
          )
          .slice(0, 5);
      },

      outputFiles: (root, args, context, info) => {
        const { id } = root;
        let outputFiles = [];

        const { outputPath } = getNodeById(id);

        return walkSync(outputPath);
      },

      inputFiles: (root, args, context, info) => {
        const { id } = root;
        const { inputPaths } = getNodeById(id);

        let inputFiles = inputPaths.map((inputPath) => walkSync(inputPath));

        return [].concat(...inputFiles);
      },
    },
  };

  const server = new ApolloServer({
    tracing: true,
    cacheControl: true,
    resolvers,
    typeDefs: gql`
      type Query {
        nodesByType(type: String): [NodeByType]
        fuzzy(value: String!): [Node]
        nodes: [Node]
        node(id: ID!): Node
      }

      type NodeByType {
        label: String
        time: Float!
        nodes: [Node]
      }

      type Node {
        id: ID!
        label: String
        pluginName: String
        buildState: BuildState
        stats: Stat
        inputPaths: [String]
        outputPath: String
        slowestNodes: [Node]
        inputFiles: [String]
        outputFiles: [String]
        inputNodeWrappers: [Node]
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
    `,
  });

  server.applyMiddleware({
    app,
    path: '/_broccoli/api/graphql',
  });
};
