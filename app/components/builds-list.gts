import { NodesByType } from 'broccoli-inspector/types';

import CollapsableComponent from 'broccoli-inspector/components/collapsable-component';
import ToFixed from 'broccoli-inspector/helpers/to-fixed';
import And from 'broccoli-inspector/helpers/and';
import Sub from 'broccoli-inspector/helpers/sub';
import gt from 'broccoli-inspector/helpers/gt';

import PaperContent from 'ember-paper/components/paper-content/component';
import PaperDivider from 'ember-paper/components/paper-divider/component';
import PaperList from 'ember-paper/components/paper-list';
import PaperItem from 'ember-paper/components/paper-item';
import PaperButton from 'ember-paper/components/paper-button';
import HrefTo from 'ember-href-to/helpers/href-to';

type Args = {
  builds: NodesByType;
};

export default class BuildsList extends CollapsableComponent<Args> {
  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.builds;
  }

  get builds(): any[] {
    return this.items;
  }

  <template>
    <PaperContent>
      <div class="paper-content--block">
        <div class="layout-row layout-align-start-center h-100">
          <div>
            <b>Builds</b>
          </div>
        </div>
      </div>
      <PaperDivider />
      <PaperList>
        {{#if this.builds}}
          {{#each this.builds key="@index" as |build|}}
            <PaperItem @class="md-3-line" @href={{HrefTo "build" build.id}}>
              <PaperButton
                @raised={{true}}
                @mini={{true}}
                @primary={{true}}
                @disabled={{true}}
              >
                {{build.id}}
              </PaperButton>
              <div class="md-list-item-text">
                <h3>{{ToFixed build.time 2}}ms</h3>
                <h4>{{build.filePath}}</h4>
                <h4>{{build.amountOfNodes}} nodes run</h4>
              </div>
            </PaperItem>
          {{/each}}

          {{#if (And this.isCollapsed (gt @builds.length 10))}}
            <PaperButton @onClick={{this.uncollapse}}>
              Show
              {{Sub @builds.length 10}}
              more builds
            </PaperButton>
          {{/if}}
        {{else}}
          <PaperItem>
            No builds found
          </PaperItem>
        {{/if}}
      </PaperList>
    </PaperContent>
  </template>
}
