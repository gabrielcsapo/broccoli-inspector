/* eslint-env node */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const socketIO = require('socket.io');
const walkSync = require('walk-sync');

module.exports = function (app, info) {
  const { watcher, httpServer } = info;
  const io = socketIO(httpServer);
  const nodeWrappersByIdLookup = nodeWrappersById(watcher.builder.builder._nodeWrappers);

  let buildRevisionId = 0;
  const buildRevisions = {};

  app.use('/_broccoli-inspector', express.static(path.resolve(__dirname, '..', 'dist')));

  // as we are building we should add on the input and output files
  watcher.builder.builder.on('endNode', (node) => {
    inputFiles(node);
    outputFiles(node);
  });

  watcher.on('change', (c) => {
    buildRevisions[buildRevisionId].filePath = c.filePath;
    // bump build revisionId so the next node events will get bucketized correctly
    buildRevisionId += 1;
  });

  watcher.builder.builder.on('endNode', (node) => {
    if(!buildRevisions[buildRevisionId]) {
      buildRevisions[buildRevisionId] = {
        nodes: [],
      };
    }

    buildRevisions[buildRevisionId]['nodes'].push({
      id: node.id,
      label: node.label,
      buildState: node.buildState
    });
  });

  io.on('connection', function (socket) {
    watcher.on('buildSuccess', (node) => {
      socket.emit('buildFinished', node);
    });

    watcher.on('buildFailure', (node) => {
      const fileContents = fs.readFileSync(path.resolve(node.broccoliPayload.location.treeDir, node.broccoliPayload.location.file), 'utf8');
      node.broccoliPayload.fileContents = fileContents.split('\n').splice(0, node.broccoliPayload.originalError.location.line + 1).join('\n')

      socket.emit('buildFailure', node);
    });

    watcher.builder.builder.on('beginNode', (node) => {
      socket.emit('beginNode', node);
    });

    watcher.builder.builder.on('endNode', (node) => {
      socket.emit('endNode', node);
    });
  });

  function trimStringToShowMatches(string, reg) {
    let trimmedString = [];

    const splitByLines = string.split('\n')
    splitByLines.forEach((line, index) => {
      if(reg.exec(line)) {
        trimmedString[0] = splitByLines[index - 1] || '';
        trimmedString[1] = line;
        trimmedString[2] = splitByLines[index + 1] || '';

        return;
      }
    })

    return trimmedString.join('\n');
  }

  function nodeWrappersById(nodeWrappers) {
    let lookup = {};

    for (const [
      ,
      _node,
    ] of nodeWrappers.entries()) {
      lookup[_node.id] = _node;
    }

    return lookup;
  }

  function slowestNodes(buildRevisions) {
    return Object.keys(buildRevisions).map((buildId) => {
      const { nodes } = buildRevisions[buildId];
      let slowestTime = 0;
      let slowestNode;

      for (const node of nodes) {
        if(node.buildState.selfTime > slowestTime) {
          slowestTime = node.buildState.selfTime;
          slowestNode = node;
        }
      }

      return {
        id: slowestNode.id,
        label: `${slowestNode.label} (${buildId})`,
        buildState: slowestNode.buildState
      };
    });
  }

  function sumFS(nodeWrappers) {
    const totalFs = {};

    for (const [
      ,
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
    // since all input directories are symlinks once we build once these paths will not change.
    if(!node.inputFiles) {
      const inputFiles = inputPaths.map((inputPath) => walkSync(inputPath));

      node.inputFiles = [].concat(...inputFiles);
    }

    return node.inputFiles;
  }

  function outputFiles(node) {
    const { outputPath } = node;

    if(!outputPath) return [];
    // since all output directories are symlinks once we build once these paths will not change.
    if(!node.outputFiles) {
      node.outputFiles = walkSync(outputPath);
    }

    return node.outputFiles;
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
      case 'object': {
        let _value = JSON.stringify(value, null, 4);

        found = search.exec(_value);
        break;
      }
      case 'string': {
        found = search.exec(value);
        break;
      }
    }

    if(found) {
      found = trimStringToShowMatches(found.input, search);
    }

    return found;
  }

  function findOutputNodeWrappers(node, id) {
    let outputNodeWrappers = [];

    node.inputNodeWrappers.forEach((inputNodeWrapper) => {
      if(parseInt(inputNodeWrapper.id) === parseInt(id)) {
        outputNodeWrappers.push({
          id: node.id
        });

        if(inputNodeWrapper.inputNodeWrappers) {
          outputNodeWrappers = outputNodeWrappers.concat(findOutputNodeWrappers(inputNodeWrapper, id));
        }
      }
    });

    return outputNodeWrappers;
  }

  const resolvers = {
    Query: {
      file(root, args, context, info) {
        const { filePath } = args;

        try {
          // TODO: should restrict to files that are only available in this project
          return {
            filePath,
            value: fs.readFileSync(filePath, 'utf8')
          }
        } catch(ex) {
          console.log(ex)
        }
      },

      nodesByType(root, args, context, info) {
        const { type } = args;

        const nodesByType = {};
        for (const [
          ,
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
            amountOfNodes: nodesByType[type].length,
            nodes: nodesByType[type],
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
        ).map((inputNode) => {
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
                stringValue: found,
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
          systemInfo: {
            type: os.type(),
            totalmem: `${os.totalmem() / 1e+6}mb`,
            cpus: os.cpus().length,
            env: JSON.stringify(process.env, null, 4),
            versions: JSON.stringify(process.versions, null, 4),
          },
          selfTime: Array.from(
            watcher.builder.builder._nodeWrappers,
            ([key, value]) => value
          ).map((inputNode) => inputNode.buildState.selfTime).reduce((a, b) => a + b),
          slowestNodes: slowestNodes(buildRevisions),
          totalFs: sumFS(watcher.builder.builder._nodeWrappers),
        }
      },

      nodes() {
        const ids = [];

        // only return the id as we don't want to unnecessarily make the graphql engine trim values
        for (const [
          ,
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

      builds() {
        return Object.keys(buildRevisions).map((buildId) => {
          const { nodes, filePath } = buildRevisions[buildId];

          return {
            id: buildId,
            filePath: filePath ? filePath.replace(process.cwd() + '/', '') : 'N/A',
            amountOfNodes: nodes.length,
            nodes,
            time: nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b) || 0
          }
        });
      },

      build(root, args, context, info) {
        const { id } = args;
        const { nodes, filePath } = buildRevisions[id];

        return {
          id,
          filePath: filePath ? filePath.replace(process.cwd() + '/', '') : 'N/A',
          amountOfNodes: nodes.length,
          nodes,
          time: nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b)
        }
      },
    },

    Node: {
      buildState: (root, args, context, info) => {
        if(root.buildState) return root.buildState;

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
        let custom = [];

        if(node['__heimdall__']._children) {
          custom = node['__heimdall__']._children.filter((c) => Object.keys(c.stats.own).length > 0).map((c) => {
            return {
              name: c.id.name,
              jsonValue: JSON.stringify(c.stats.own, null, 4)
            }
          });

          node['__heimdall__']._children.map((c) => {
            for(const monitorName of Object.keys(c.stats)) {
              if(!['time', 'fs', 'own', 'custom'].includes(monitorName)) {
                custom.push({
                  name: monitorName,
                  jsonValue: JSON.stringify(c.stats[monitorName], null, 4)
                });
              }
            }
          });

          // Traverse this until we get to a node that is the applyPatches, we should use this for cases with broccoli-persistent-filter
          for(const child of node['__heimdall__']._children) {
            if(child.id.name === 'applyPatches') {
              stats = child.stats;
            }
          }
        }

        return Object.assign(stats, { custom });
      },

      inputNodeWrappers: (root, args, context, info) => {
        const { id } = root;
        const { inputNodeWrappers=[] } = nodeWrappersByIdLookup[id];

        return inputNodeWrappers.map(({ id }) => {
          return { id }
        });
      },

      outputNodeWrappers: (root, args, context, info) => {
        const { id } = root;
        let outputNodeWrappers = [];

        for (const [
          ,
          _node,
        ] of watcher.builder.builder._nodeWrappers.entries()) {
          outputNodeWrappers = outputNodeWrappers.concat(findOutputNodeWrappers(_node, id));
        }

        return outputNodeWrappers;
      },

      pluginName: (root, args, context, info) => {
        const { id } = root;
        const node = nodeWrappersByIdLookup[id];

        const { id: heimdallId } = node['__heimdall__'];
        const { broccoliPluginName } = heimdallId;

        return broccoliPluginName;
      },

      label: (root, args, context, info) => {
        if(root.label) return root.label;

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
        file(filePath: String!): File
        nodesByType(type: String): [NodeByType]
        search(value: String!): [SearchResult]
        nodes: [Node]
        node(id: ID!): Node
        builds: [Build]
        build(id: ID!): Build
        dashboard: Dashboard
      }

      type Build {
        id: ID!
        filePath: String
        amountOfNodes: Float
        nodes: [Node]
        time: Float!
      }

      type SearchResultItem {
        stringValue: String
        property: String
      }

      type SearchResult {
        node: Node
        results: [SearchResultItem]
      }

      type SystemInfo {
        totalmem: String
        type: String
        cpus: Float
        env: String
        versions: String
      }

      type Dashboard {
        systemInfo: SystemInfo
        selfTime: Float
        slowestNodes: [Node]
        totalFs: FS
      }

      type NodeByType {
        label: String
        time: Float!
        amountOfNodes: Float
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
        outputNodeWrappers: [Node]
      }

      type File {
        filePath: String
        value: String
      }

      type BuildState {
        selfTime: Float!
        totalTime: Float!
      }

      type CustomStat {
        name: String,
        jsonValue: String,
      }

      type Stat {
        custom: [CustomStat]
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
