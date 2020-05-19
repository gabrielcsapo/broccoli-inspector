import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query {
    nodes {
      id
      label
      nodeInfo {
        instantiationStack
        annotation
      }
      buildState {
        selfTime
        totalTime
      }
    }
  }
`;

const buildsQuery = gql`
  query query {
    builds {
      id
      filePath
      time
      amountOfNodes
    }
  }
`;

const groupPluginsQuery = gql`
  query query {
    nodesByType {
      label
      time
      amountOfNodes
    }
  }
`

const groupPluginsSearchQuery = gql`
  query query($type: String!) {
    nodesByType(type: $type) {
      label
      time
      nodes {
        id
        label
        nodeInfo {
          instantiationStack
          annotation
        }
        buildState {
          selfTime
          totalTime
        }
      }
    }
  }
`

function sortNodes(nodes, filter) {
  return nodes
  .filter((node) => {
    if(!filter) return true;
    if(filter && new RegExp(filter, 'i').exec(node.label)) return true;
  })
  .sort(
    (nodeA, nodeB) => nodeB.buildState.selfTime - nodeA.buildState.selfTime
  )
}

export default class ApplicationRoute extends Route {
  queryParams = {
    pluginType: {
      refreshModel: true
    },
    queryContext: {
      refreshModel: true
    }
  };

  @queryManager apollo;
  @service('router') router;
  @service('socket-io') socketIO;

  constructor() {
    super(...arguments);

    // In order for broccoli-inspector the middleware needs to be set and serving this asset
    // We can depend on socket.io being setup if that is the case
    const socket = this.socketIO.socketFor(window.location.origin);

    socket.on('beginNode', this.beginNode, this);
    socket.on('endNode', this.endNode, this);
    socket.on('buildSuccess', this.buildSuccess, this);
    socket.on('buildFailure', this.buildFailure, this);
  }

  afterModel() {
    this.controllerFor('application').set('isLoading', false);
  }

  model(params) {
    this.controllerFor('application').set('isLoading', true);

    const { pluginType, queryContext } = params;

    if(queryContext === 'group') {
      if(pluginType) {
        return this.apollo.query({ query: groupPluginsSearchQuery, variables: { type: pluginType } }, "nodesByType").then((result) => {
          const nodes = result[0] && result[0].nodes ? sortNodes(result[0].nodes) : [];

          return { nodes }
        });
      }

      return this.apollo.query({ query: groupPluginsQuery }, "nodesByType").then((result) => {
        return { nodesByType: result.sort((nodeA, nodeB) => nodeB.time - nodeA.time) }
      });
    }

    if(queryContext === 'builds') {
      return this.apollo.query({ query: buildsQuery }, "builds").then((result) => {
        return { builds: result }
      });
    }

    return this.apollo.query({ query }, "nodes").then((result) => {
      return { nodes: sortNodes(result) }
    });
  }

  buildSuccess(currentBuild) {
    this.controller.set('isBuilding', false);
    this.controller.set('totalBuildTime', currentBuild.totalTime / 1000000);
  }

  buildFailure(currentBuild) {
    if(currentBuild.isBuilderError) {
      const { broccoliPayload } = currentBuild;
      const { originalError, nodeLabel, nodeId, error, fileContents } = broccoliPayload;
      this.controller.set('buildError', {
        fileContents,
        line: originalError.location.line,
        location: error.location.file,
        message: error.message,
        nodeId,
        nodeLabel,
      })
    }
  }

  endNode(data) {
    const currentBuildTime = this.controller.get('currentBuildTime') + data.buildState.selfTime;

    this.controller.set('currentBuildTime', currentBuildTime);
  }

  beginNode(data) {
    // if we were previously not building we should reset the stats
    if(!this.controller.get('isBuilding')) {
      this.controller.set('currentBuildTime', 0);
    }

    this.controller.set('isBuilding', true);
    this.controller.set('currentNode', data.label);
  }
}
