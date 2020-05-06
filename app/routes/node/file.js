import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($filePath: String!) {
    file(filePath: $filePath) {
      value
    }
  }
`;

export default class PluginsRoute extends Route {
  @queryManager apollo;

  constructor() {
    super(...arguments);
  }

  model(params) {
    const { filePath, column, line } = params;

    return this.apollo.query({ query, variables: { filePath } }, "file").then((result) => {
      return {
        filePath,
        column,
        line,
        file: result.value,
      }
    });
  }
}
