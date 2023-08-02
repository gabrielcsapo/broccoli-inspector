import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';

import PaperCard from 'ember-paper/components/paper-card';
import PaperTabs from 'ember-paper/components/paper-tabs';

interface Args {
  systemInfo: SystemInfo;
}

export default class SystemInfo extends Component<Args> {
  @tracked
  selectedIndex = 0;

  get systemInfoKeys() {
    return Object.keys(this.args.systemInfo).filter(
      (key) => key.toUpperCase() !== '__TYPENAME'
    );
  }

  get selectedSystemInfoData() {
    const key = Object.keys(this.args.systemInfo)[this.selectedIndex];

    // gettting the prop of the key we found at the index point
    return (this.args.systemInfo as any)[key];
  }

  <template>
    <PaperCard as |card|>
      <card.title as |title|>
        <title.text as |text|>
          <text.headline>System Info</text.headline>
          <text.subhead>Information on the current system</text.subhead>
        </title.text>
      </card.title>
      <PaperTabs
        @stretch={{true}}
        @borderBottom={{true}}
        @selected={{this.selectedIndex}}
        @onChange={{fn (mut this.selectedIndex)}}
        as |tabs|
      >
        {{#each this.systemInfoKeys as |key|}}
          <tabs.tab>
            {{key}}
          </tabs.tab>
        {{/each}}
      </PaperTabs>
      <card.content @class="p-0">
        <pre class="m-0"><code>{{this.selectedSystemInfoData}}</code></pre>
      </card.content>
    </PaperCard>
  </template>
}
