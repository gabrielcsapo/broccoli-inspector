import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';

import CollapsableComponent from './collapsable-component';

import { type Node } from 'broccoli-inspector/types';

import toFixed from 'broccoli-inspector/helpers/to-fixed';
import gt from 'broccoli-inspector/helpers/gt';
import and from 'broccoli-inspector/helpers/and';
import sub from 'broccoli-inspector/helpers/sub';

import PaperContent from 'ember-paper/components/paper-content/component';
import PaperDivider from 'ember-paper/components/paper-divider/component';
import PaperInput from 'ember-paper/components/paper-input';
import PaperList from 'ember-paper/components/paper-list';
import PaperItem from 'ember-paper/components/paper-item';
import PaperTooltip from 'ember-paper/components/paper-tooltip';
import PaperButton from 'ember-paper/components/paper-button';
import PaperIcon from 'ember-paper/components/paper-icon';
import HrefTo from 'ember-href-to/helpers/href-to';

interface Args {
  nodes: Node[];
  pluginType: string;
}

export default class PluginList extends CollapsableComponent<Args> {
  @tracked
  searchByValue = '';

  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.nodes;
  }

  get nodes() {
    if (this.searchByValue) {
      return this.items.filter(({ label }: { label: string }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodes
      .map((node) => node.buildState.selfTime)
      .reduce((a, b) => a + b);
  }

  <template>
    <PaperContent>
      <div class="paper-content--block">
        <div class="layout-row layout-align-start-center h-100">
          <div>
            <b>Plugins</b>
          </div>
        </div>
      </div>
      <PaperDivider />
      {{#if @pluginType}}
        <div class="paper-content--block">
          <div class="layout-row layout-align-center-center h-100">
            <div>
              {{@pluginType}}
              <PaperButton
                @iconButton={{true}}
                @href={{HrefTo "dashboard" (query-params pluginType=null)}}
              >{{PaperIcon "cancel"}}</PaperButton>
            </div>
          </div>
        </div>
      {{/if}}
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
        {{#if this.nodes}}
          {{#each this.nodes key="@index" as |node|}}
            <PaperItem
              data-list-item={{node.id}}
              @class="md-3-line"
              @href={{HrefTo "node" node.id}}
            >
              <div class="md-list-item-text">
                <h3>{{node.label}}</h3>
                <h4>{{toFixed node.buildState.selfTime 3}}ms</h4>
              </div>

              <PaperTooltip
                @position="right"
                @attachTo="[data-list-item='{{node.id}}']"
              >
                {{node.label}}
              </PaperTooltip>
            </PaperItem>
          {{/each}}

          {{#if (and this.isCollapsed (gt @nodes.length 10))}}
            <PaperButton @onClick={{this.uncollapse}}>Show
              {{sub @nodes.length 10}}
              more nodes</PaperButton>
          {{/if}}
        {{else}}
          <PaperItem>
            No nodes found
          </PaperItem>
        {{/if}}
      </PaperList>

    </PaperContent>
  </template>
}
