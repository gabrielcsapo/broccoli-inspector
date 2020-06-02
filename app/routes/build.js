import Route from '@ember/routing/route';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($id: ID!) {
    build(id: $id) {
      id
      filePath
      time,
      nodes {
        id
        label
        pluginName
        buildState {
          selfTime
          totalTime
        }
      }
    }
  }
`;

export default class BuildRoute extends Route {
  @queryManager apollo;

  constructor() {
    super(...arguments);
  }

  model(params) {
    const { id } = params;

    return this.apollo.query({ query, variables: { id }, fetchPolicy: 'no-cache' }, "build").catch((ex) => {
      return {
        error: ex.message
      }
    });
  }
}
