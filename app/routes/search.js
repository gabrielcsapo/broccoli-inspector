import Route from '@ember/routing/route';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($value: String!) {
    search(value: $value) {
      node {
        id
        label
      }
      results {
        stringValue
        property
      }
    }
  }
`;

export default class SearchRoute extends Route {
  queryParams = {
    query: {
      refreshModel: true
    },
  };

  @queryManager apollo;

  model(params) {
    const { query: _query } = params;

    if(!_query) return {};

    return this.apollo.query({ query, variables: { value: _query } }, "search").then((result) => {
      return {
        query: _query,
        result
      };
    });
  }
}
