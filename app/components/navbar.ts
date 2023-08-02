import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import type Router from "@ember/routing/router";

export default class Navbar extends Component {
  @service
  declare router: Router;

  @tracked
  searchTerm = "";

  @tracked
  searchFormOpen = false;

  @action
  toggleSearchForm() {
    this.searchFormOpen = !this.searchFormOpen;
  }

  // TOOD: fix this with the right type
  @action
  search(e: any) {
    if (e.keyCode === 13) {
      this.router.transitionTo("search", {
        queryParams: { query: encodeURI(this.searchTerm) },
      });
    }
  }
}
