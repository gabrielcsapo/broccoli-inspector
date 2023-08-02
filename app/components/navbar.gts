import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type Router from '@ember/routing/router';
import { LinkTo } from '@ember/routing';
import { fn } from '@ember/helper';

import PaperToolbar from 'ember-paper/components/paper-toolbar';
import PaperInput from 'ember-paper/components/paper-input';
import PaperButton from 'ember-paper/components/paper-button';
import PaperToolbarTools from 'ember-paper/components/paper-toolbar-tools';
import PaperTooltip from 'ember-paper/components/paper-tooltip';
import PaperIcon from 'ember-paper/components/paper-icon';

import HrefTo from 'ember-href-to/helpers/href-to';

export default class Navbar extends Component {
  @service
  declare router: Router;

  @tracked
  searchTerm = '';

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
      this.router.transitionTo('search', {
        queryParams: { query: encodeURI(this.searchTerm) },
      });
    }
  }

  <template>
    <PaperToolbar>
      {{#if this.searchFormOpen}}
        <div class="full-length-search">
          <PaperInput
            @placeholder="Search all nodes"
            @type="text"
            @value={{this.searchTerm}}
            @onChange={{fn (mut this.searchTerm)}}
            @onKeyDown={{this.search}}
          />

          <PaperButton @onClick={{this.toggleSearchForm}} @iconButton={{true}}>
            {{PaperIcon "cancel"}}
          </PaperButton>
        </div>
      {{else}}
        <PaperToolbarTools>
          <LinkTo @route="index" class="layout-row layout-align-center-center">
            <img
              height="40"
              src="/_broccoli-inspector/assets/images/logo/logo-grey.png"
              alt="Broccoli Inspector in white fill background"
            />
            &nbsp;Broccoli Inspector
          </LinkTo>
          <span class="flex"></span>
          <PaperButton @href={{HrefTo "dashboard"}} @iconButton={{true}}>
            {{PaperIcon "dashboard"}}

            <PaperTooltip @position="bottom">
              Dashboard
            </PaperTooltip>
          </PaperButton>

          <PaperButton @onClick={{this.toggleSearchForm}} @iconButton={{true}}>
            {{PaperIcon "search"}}

            <PaperTooltip @position="bottom">
              Search
            </PaperTooltip>
          </PaperButton>
        </PaperToolbarTools>
      {{/if}}
    </PaperToolbar>
  </template>
}
