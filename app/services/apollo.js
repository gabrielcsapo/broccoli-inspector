import ApolloService from 'ember-apollo-client/services/apollo';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

export default class ApolloBroccoliInspector extends ApolloService {
  get options() {
    // config:environment not injected into tests, so try to handle that gracefully.
    let config = getOwner(this).resolveRegistration('config:environment');

    if (config && config.apollo) {
      // we don't know the url that we are trying to serve graphql over at build time
      // using the current url is safe because we are being served over the same middleware as graphql
      config.apollo.apiURL = window.location.origin + '/broccoli-inspector/api/graphql';

      return config.apollo;
    } else if (Ember.testing) {
      return {
        apiURL: 'http://testserver.example/v1/graph',
      };
    }
    throw new Error('no Apollo service options defined');
  }
}
