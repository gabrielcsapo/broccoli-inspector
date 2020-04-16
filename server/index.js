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
      buildState: BuildState,
      slowestNodes: [Node]
      inputFiles: [String]
      outputFiles: [String]
    }

    type BuildState {
      selfTime: Float!
      totalTime: Float!
    }

    schema {
      query: Query
    }
  ` });

  server.applyMiddleware({ app, path: '/_broccoli/api/graphql' });
}
