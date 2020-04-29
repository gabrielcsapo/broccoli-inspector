/* eslint-env node */
'use strict';

const path = require('path');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const socketIO = require('socket.io');
const walkSync = require('walk-sync');

module.exports = function (app, info) {
  const { watcher, httpServer } = info;
  const io = socketIO(httpServer);
  const nodeWrappersByIdLookup = nodeWrappersById(watcher.builder.builder._nodeWrappers);

  app.use('/_broccoli-inspector', express.static(path.resolve(__dirname, '..', 'dist')));

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

  function nodeWrappersById(nodeWrappers) {
    let lookup = {};

    for (const [
      index,
      _node,
    ] of watcher.builder.builder._nodeWrappers.entries()) {
      lookup[_node.id] = _node;
    }

    return lookup;
  }

  function slowestNode(nodeWrappers) {
    let slowestTime = 0;
    let slowestNode;

    for (const [
      index,
      _node,
    ] of nodeWrappers.entries()) {
      if(_node.buildState.selfTime > slowestTime) {
        slowestTime = _node.buildState.selfTime;
        slowestNode = _node;
      }
    }

    return slowestNode;
  }

  function sumFS(nodeWrappers) {
    const totalFs = {};

    for (const [
      index,
      _node,
    ] of nodeWrappers.entries()) {
      const { stats } = _node['__heimdall__']
      const { fs } = stats;

      for(const operation of Object.keys(fs || {})) {
        if(!totalFs[operation]) {
          totalFs[operation] = {
            count: 0,
            time: 0,
          };
        }

        totalFs[operation].count += fs[operation].count;
        totalFs[operation].time += fs[operation].time;
      }
    }

    return totalFs;
  }

  function inputFiles(node) {
    const { inputPaths } = node;

    if(!inputPaths) return [];

    const inputFiles = inputPaths.map((inputPath) => walkSync(inputPath));

    return [].concat(...inputFiles);
  }

  function outputFiles(node) {
    const { outputPath } = node;

    if(!outputPath) return [];

    return walkSync(outputPath);
  }

  function get(obj, path) {
    var paths = path.split('.');
    var current = obj;
    var i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  }

  function fuzzy(value, search) {
    let found = '';

    switch(typeof value) {
      case 'object':
        let _value = JSON.stringify(value, null, 4);

        found = search.exec(_value);
        break;
      case 'string':
        found = search.exec(value);
        break;
    }

    return found;
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

      /**
        {
          node: Node
          highlightedString: String
          property: String
        }
      **/
      search(root, args, context, info) {
        const { value } = args;
        const reg = new RegExp(value, 'i');
        const finalResults = [];

        const searchablePaths = [
          "id",
          "label",
          "buildState.selfTime",
          "buildState.totalTime",
          "nodeInfo.instantiationStack",
          "nodeInfo.annotation",
          "nodeInfo.persistentOutput",
          "nodeInfo.needsCache",
          "nodeInfo.volatile",
          "nodeInfo.trackInputChanges",
          "inputFiles",
          "outputFiles",
        ];

        Array.from(
          watcher.builder.builder._nodeWrappers,
          ([key, value]) => value
        ).forEach((inputNode) => {
          let currentNodeResults = [];
          for(const _path of searchablePaths) {
            let search = '';

            if(_path === 'outputFiles') {
              search = outputFiles(inputNode);
            } else if(_path === 'inputFiles') {
              search = inputFiles(inputNode);
            } else {
              search = get(inputNode, _path);
            }

            const found = fuzzy(search, reg);

            if(found) {
              currentNodeResults.push({
                stringValue: found.input,
                property: _path
              });
            }
          }

          if(currentNodeResults.length > 0) {
            finalResults.push({
              node: inputNode,
              results: currentNodeResults,
            });
          }
        });

        return finalResults;
      },

      dashboard() {
        return {
          selfTime: Array.from(
            watcher.builder.builder._nodeWrappers,
            ([key, value]) => value
          ).map((inputNode) => inputNode.buildState.selfTime).reduce((a, b) => a + b),
          slowestNode: slowestNode(watcher.builder.builder._nodeWrappers),
          totalFs: sumFS(watcher.builder.builder._nodeWrappers),
        }
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
        const { buildState } = nodeWrappersByIdLookup[id];

        return buildState;
      },

      nodeInfo: (root, args, context, info) => {
        const { id } = root;
        const { nodeInfo } = nodeWrappersByIdLookup[id];

        return nodeInfo;
      },

      stats: (root, args, context, info) => {
        const { id } = root;
        const node = nodeWrappersByIdLookup[id];

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
        const { inputNodeWrappers=[] } = nodeWrappersByIdLookup[id];

        return inputNodeWrappers.map(({ id }) => {
          return { id }
        });
      },

      pluginName: (root, args, context, info) => {
        const { id } = root;
        const node = nodeWrappersByIdLookup[id];

        const { id: heimdallId } = node['__heimdall__'];
        const { broccoliPluginName } = heimdallId;

        return broccoliPluginName;
      },

      label: (root, args, context, info) => {
        const { id } = root;
        const { label } = nodeWrappersByIdLookup[id];

        return label;
      },

      inputPaths: (root, args, context, info) => {
        const { id } = root;
        const { inputPaths } = nodeWrappersByIdLookup[id];

        return inputPaths;
      },

      outputPath: (root, args, context, info) => {
        const { id } = root;
        const { outputPath } = nodeWrappersByIdLookup[id];

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

        return outputFiles(nodeWrappersByIdLookup[id]);
      },

      inputFiles: (root, args, context, info) => {
        const { id } = root;

        return inputFiles(nodeWrappersByIdLookup[id])
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
        search(value: String!): [SearchResult]
        nodes: [Node]
        node(id: ID!): Node
        dashboard: Dashboard
      }

      type SearchResultItem {
        stringValue: String
        property: String
      }

      type SearchResult {
        node: Node
        results: [SearchResultItem]
      }

      type Dashboard {
        selfTime: Float
        slowestNode: Node
        totalFs: FS
      }

      type NodeByType {
        label: String
        time: Float!
        nodes: [Node]
      }

      type NodeInfo {
        instantiationStack: String
        annotation: String
        persistentOutput: Boolean
        needsCache: Boolean
        volatile: Boolean
        trackInputChanges: Boolean
      }

      type Node {
        id: ID!
        label: String
        pluginName: String
        buildState: BuildState
        nodeInfo: NodeInfo
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
    path: '/broccoli-inspector/api/graphql',
  });
};