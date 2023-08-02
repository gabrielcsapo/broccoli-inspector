import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';

import { Node } from 'broccoli-inspector/types';
import Table from 'broccoli-inspector/components/table';
import eq from 'broccoli-inspector/helpers/eq';

import PaperCard from 'ember-paper/components/paper-card';
import PaperTabs from 'ember-paper/components/paper-tabs';
import C3Chart from 'ember-c3/components/c3-chart';

type Args = {
  slowestNodes: Node[];
};

export default class SlowestNodes extends Component<Args> {
  @tracked
  selectedTab = 0;

  get slowestNodes() {
    return this.args.slowestNodes;
  }

  get table() {
    return {
      header: ['ID', 'Time', 'Node Label'],
      body: this.slowestNodes.map((slowestNode) => {
        return [
          slowestNode.id,
          Number(slowestNode.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: slowestNode.label,
            linkModel: slowestNode.id,
            linkRoute: 'node',
          },
        ];
      }),
    };
  }

  get data() {
    return {
      columns: this.slowestNodes.map((slowestNode) => {
        return [slowestNode.label, slowestNode.buildState.selfTime];
      }),
      type: 'bar',
    };
  }

  <template>
    <PaperCard as |card|>
      <card.title as |title|>
        <title.text as |text|>
          <text.headline>Slowest Nodes</text.headline>
          <text.subhead>Slowest nodes across all builds.</text.subhead>
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
        <C3Chart @data={{this.data}} />
      {{else}}
        <Table
          @title="Slowest Node"
          @data={{this.table}}
          @empty="No slowest node data available"
        />
      {{/if}}
    </PaperCard>
  </template>
}
