import CollapsableComponent from './collapsable-component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';

import { NodesByType } from 'broccoli-inspector/types';

import gt from 'broccoli-inspector/helpers/gt';
import sub from 'broccoli-inspector/helpers/sub';
import and from 'broccoli-inspector/helpers/and';
import toFixed from 'broccoli-inspector/helpers/to-fixed';

import PaperContent from 'ember-paper/components/paper-content/component';
import PaperDivider from 'ember-paper/components/paper-divider/component';
import PaperInput from 'ember-paper/components/paper-input';
import PaperList from 'ember-paper/components/paper-list';
import PaperItem from 'ember-paper/components/paper-item';
import PaperIcon from 'ember-paper/components/paper-icon';
import PaperButton from 'ember-paper/components/paper-button';
import HrefTo from 'ember-href-to/helpers/href-to';

interface Args {
  nodesByType: NodesByType[];
}

export default class GroupedPluginList extends CollapsableComponent<Args> {
  @tracked
  searchByValue = '';

  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.nodesByType;
  }

  get nodesByType() {
    if (this.searchByValue) {
      return this.items.filter(({ label }: { label: string }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodesByType
      .map((nodeByType) => nodeByType.time)
      .reduce((a, b) => a + b);
  }

  <template>
    <PaperContent>
      <div class="paper-content--block">
        <div class="layout-row layout-align-start-center h-100">
          <div>
            <b>Plugins Grouped</b>
          </div>
        </div>
      </div>
      <PaperDivider />
      <div class="paper-content--block">
        <div class="layout-row layout-align-start-center h-100">
          <div>
            {{PaperIcon "access_time"}}
            {{this.time}}ms
          </div>
        </div>
      </div>
      <PaperDivider />
      <div class="paper-content--block">
        <PaperInput
          @placeholder="Filter plugins"
          @type="text"
          @value={{this.searchByValue}}
          @onChange={{fn (mut this.searchByValue)}}
          @icon="search"
        />
      </div>
      <PaperDivider />
      <PaperList>
        {{#if this.nodesByType}}
          {{#each this.nodesByType key="@index" as |node|}}
            <PaperItem
              @class="md-3-line"
              @href={{HrefTo "index" (query-params pluginType=node.label)}}
            >
              <div class="md-list-item-text">
                <h3>{{node.label}}</h3>
                <h4>{{toFixed node.time 3}}ms</h4>
              </div>
              <div class="md-secondary-container">
                ({{node.amountOfNodes}})
              </div>
            </PaperItem>
          {{/each}}

          {{#if (and this.isCollapsed (gt @nodesByType.length 10))}}
            <PaperButton @onClick={{this.uncollapse}}>Show
              {{sub @nodesByType.length 10}}
              more grouped plugins</PaperButton>
          {{/if}}
        {{else}}
          <PaperItem>
            No plugins found
          </PaperItem>
        {{/if}}
      </PaperList>

    </PaperContent>
  </template>
}
