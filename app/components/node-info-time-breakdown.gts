import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';

import { type FS } from 'broccoli-inspector/types';

import eq from 'broccoli-inspector/helpers/eq';
import Table from 'broccoli-inspector/components/table';

import PaperCard from 'ember-paper/components/paper-card';
import PaperTabs from 'ember-paper/components/paper-tabs';
import C3Chart from 'ember-c3/components/c3-chart';

interface Args {
  fs?: FS;
  selfTime: number;
}

export default class NodeInfoTimeBreakdown extends Component<Args> {
  chart = null;

  title = { text: '' };
  padding = { top: 20 };

  @tracked
  selectedTab = 0;

  get fs() {
    const fs = this.args?.fs || {};

    const body = Object.keys(fs)
      .filter((key) => {
        const item = (fs as any)[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = (fs as any)[keyA];
        const rowB = (fs as any)[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = (fs as any)[key];
        // time is ns and we want to convert to ms
        return [key, { raw: time, text: `${time / 1000000}ms` }, count];
      });

    return {
      header: [`Operation`, `Time`, `Count`],
      body,
    };
  }

  onclick(...args: any) {
    console.log(args);
  }

  get data() {
    const fs = this.args?.fs || {};
    const selfTime = this.args.selfTime;

    let fsTime = 0;

    for (const operation in fs) {
      if (!(fs as any)[operation] || !(fs as any)[operation].time) continue;
      fsTime += (fs as any)[operation].time;
    }

    return {
      columns: [
        ['FS', fsTime / 1000000],
        ['Other', selfTime - fsTime / 1000000],
      ],
      type: 'pie',
      onclick: this.onclick,
    };
  }

  get tooltip() {
    return {
      format: {
        value: function (value: string, ratio: number) {
          return `${value}ms | ${Number(ratio * 100).toFixed(0)}%`;
        },
      },
    };
  }

  get pie() {
    return {
      label: {
        format: function (value: string) {
          return value;
        },
      },
    };
  }

  <template>
    <PaperCard as |card|>
      <card.title as |title|>
        <title.text as |text|>
          <text.headline>Node Time Breakdown</text.headline>
          <text.subhead>This node's time is compromised of fs and other. Other
            consists of operations that occur in the plugin itself. Please see
            the Heimdall Schema section for more context to what that could be.</text.subhead>
        </title.text>
      </card.title>
      <PaperTabs
        @stretch={{true}}
        @borderBottom={{true}}
        @selected={{this.selectedTab}}
        @onChange={{fn (mut this.selectedTab)}}
        as |tabs|
      >
        <tabs.tab>
          Chart
        </tabs.tab>
        <tabs.tab>
          Table
        </tabs.tab>
      </PaperTabs>
      {{#if (eq this.selectedTab 0)}}
        <C3Chart
          @data={{this.data}}
          @title={{this.title}}
          @padding={{this.padding}}
          @c3chart={{this.chart}}
          @tooltip={{this.tooltip}}
          @pie={{this.pie}}
        />
      {{else}}
        <Table
          @title="FS Timing"
          @data={{this.fs}}
          @empty="No FS Timing available"
        />
      {{/if}}
    </PaperCard>
  </template>
}
