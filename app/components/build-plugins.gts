import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { type Node } from 'broccoli-inspector/types';
import { fn } from '@ember/helper';

import eq from 'broccoli-inspector/helpers/eq';
import Table from 'broccoli-inspector/components/table';

import PaperCard from 'ember-paper/components/paper-card';
import PaperTabs from 'ember-paper/components/paper-tabs';
import C3Chart from 'ember-c3/components/c3-chart';

interface Args {
  nodes?: Node[];
}

export default class BuildPlugins extends Component<Args> {
  @tracked
  selectedTab = 0;

  get nodes() {
    const nodes = this.args?.nodes || [];

    const body = nodes.map((node) => {
      return [
        node.id,
        {
          text: node.label,
          linkModel: node.id,
          linkRoute: 'node',
        },
        {
          raw: node.buildState.selfTime,
          text: `${node.buildState.selfTime}ms`,
        },
      ];
    });

    return {
      header: [`ID`, `Label`, `Time`],
      body,
    };
  }

  get axis() {
    return {
      x: {
        type: 'category',
      },
    };
  }

  get data() {
    const nodes = this.args?.nodes || [];

    const json = nodes
      .filter((node) => {
        return node.buildState.selfTime !== 0 && node.buildState.selfTime > 50;
      })
      .map((node) => {
        return {
          label: node.label,
          selfTime: node.buildState.selfTime,
        };
      });

    return {
      json,
      keys: {
        x: 'label',
        value: ['selfTime'],
      },
      type: 'bar',
    };
  }

  <template>
    <PaperCard as |card|>
      <card.title as |title|>
        <title.text as |text|>
          <text.headline>Plugins run</text.headline>
          <text.subhead>This shows plugins that were run for this specific
            build.</text.subhead>
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
        <C3Chart @data={{this.data}} @axis={{this.axis}} />
      {{else}}
        <Table @title="" @data={{this.nodes}} @empty="No Plugin information" />
      {{/if}}
    </PaperCard>
  </template>
}
