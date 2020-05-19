import Component from "@glimmer/component";
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Navbar extends Component {
  @service
  router;

  @tracked
  searchTerm = '';

  @tracked
  searchFormOpen = false;

  @action
  toggleSearchForm() {
    this.searchFormOpen = !this.searchFormOpen;
  }

  @action
  search(e) {
    if(e.keyCode === 13) {
      this.router.transitionTo('search', {
        queryParams: { query: encodeURI(this.searchTerm) }
      });
    }
  }
}
