import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($id: ID!) {
    node(id: $id) {
      id
      label
      inputFiles
      outputFiles
      buildState {
        selfTime
        totalTime
      }
    }
  }
`;

export default class PluginsRoute extends Route {
  @queryManager apollo;

  constructor() {
    super(...arguments);
  }

  model(params) {
    const { id } = params;

    return this.apollo.query({ query, variables: { id } }, "node");
  }
}
