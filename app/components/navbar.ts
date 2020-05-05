import Component from "@glimmer/component";
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
  @service
  router;

  @action
  search(e) {
    e.preventDefault();
    e.stopPropagation();

    const value = e.target.value;

    this.router.transitionTo('search', {
      queryParams: { query: encodeURI(value) }
    });

    return false;
  }
}
