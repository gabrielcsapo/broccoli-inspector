import Component from "@glimmer/component";
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
  @service
  router;

  @action
  search(e) {
    const value = e.target.value;

    this.router.transitionTo('search', {
      queryParams: { query: encodeURI(value) }
    })
  }
}
