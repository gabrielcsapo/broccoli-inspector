import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    console.log(_query)
    if(!_query) return {};

    return this.apollo.query({ query, variables: { value: _query } }, "search").then((result) => {
      return {
        query: _query,
        result
      };
    });
  }
}
