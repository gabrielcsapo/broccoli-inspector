import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query {
    nodes {
      id
      label
      buildState {
        selfTime
        totalTime
      }
    }
  }
`;

export default class ApplicationRoute extends Route {
  @queryManager apollo;
  @service('socket-io') socketIO;

  constructor() {
    super(...arguments);

    const socket = this.socketIO.socketFor(`http://localhost:4200`);

    socket.on('beginNode', this.beginNode, this);
    socket.on('endNode', this.endNode, this);
    socket.on('buildFinished', this.buildFinished, this);
  }

  model(params) {
    const { id } = params;

    return this.apollo.query({ query }, "nodes").then((result) => {
      return { nodes: result }
    });
  }

  buildFinished() {
    this.controller.set('isBuilding', false);
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
    console.log(this.controller.get('currentNode'));
  }
}
