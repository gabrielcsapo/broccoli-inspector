import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Node } from 'broccoli-inspector/types';
import type RouterService from '@ember/routing/router-service';
import { fn } from '@ember/helper';

import html from 'broccoli-inspector/helpers/html';

import NodeInfoTimeBreakdown from 'broccoli-inspector/components/node-info-time-breakdown';
import EmptyState from 'broccoli-inspector/components/empty-state';
import InstantiationStackExplorer from 'broccoli-inspector/components/instantiation-stack-explorer';
import Table from 'broccoli-inspector/components/table';

import PaperCard from 'ember-paper/components/paper-card';
import PaperTabs from 'ember-paper/components/paper-tabs';

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  @service
  declare router: RouterService;

  @tracked
  selectedHeimdallCustomSchemaIndex = 0;

  get selectedHeimdallCustomSchema() {
    return (this.args.node as any).stats.custom[
      this.selectedHeimdallCustomSchemaIndex
    ];
  }

  get info() {
    const node = this.args.node;
    const nodeInfo = node?.nodeInfo || {};

    const body = Object.keys(nodeInfo)
      .filter(
        (prop) => prop.indexOf('__') === -1 && prop !== 'instantiationStack'
      )
      .map((prop) => [prop, (nodeInfo as any)[prop]]);

    if (node?.pluginName) {
      body.push(['pluginName', node.pluginName]);
    }

    return {
      header: ['Property', 'Value'],
      body,
    };
  }

  @action
  onInfoTableClick(e: any) {
    e.stopPropagation();
    e.preventDefault();

    if (e.target && e.target.dataset['filePath']) {
      const { filePath, line, column } = e.target.dataset;

      if (this.args?.node?.id) {
        this.router.transitionTo('node.file', this.args?.node?.id, {
          queryParams: { filePath: encodeURI(filePath), line, column },
        });
      } else {
        alert('selected node has no id');
      }
    }

    return false;
  }

  get inputNodeWrappers() {
    const node = this.args.node;
    const inputNodeWrappers = node?.inputNodeWrappers || [];

    return {
      header: ['ID', 'Time', 'Node Label'],
      body: inputNodeWrappers.map((inputNodeWrapper) => {
        return [
          inputNodeWrapper.id,
          Number(inputNodeWrapper.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: inputNodeWrapper.label,
            linkModel: inputNodeWrapper.id,
            linkRoute: 'node',
          },
        ];
      }),
    };
  }

  get outputNodeWrappers() {
    const node = this.args.node;
    const outputNodeWrappers = node?.outputNodeWrappers || [];

    return {
      header: ['ID', 'Time', 'Node Label'],
      body: outputNodeWrappers.map((outputNodeWrapper) => {
        return [
          outputNodeWrapper.id,
          Number(outputNodeWrapper.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: outputNodeWrapper.label,
            linkModel: outputNodeWrapper.id,
            linkRoute: 'node',
          },
        ];
      }),
    };
  }

  get files() {
    const body = [];
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];
    const tableHeight = Math.max(inputFiles.length, outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      body.push([inputFiles[i], outputFiles[i]]);
    }

    return {
      header: [
        `Input Files (${inputFiles.length})`,
        `Output Files (${outputFiles.length})`,
      ],
      body,
    };
  }

  <template>
    <h1 class="mt-4">
      ({{@node.id}})
      {{@node.label}}
      ({{@node.buildState.selfTime}}ms)</h1>

    <InstantiationStackExplorer
      @instantiationStack={{@node.nodeInfo.instantiationStack}}
    />

    <br />

    <Table
      @title="Node Info"
      @data={{this.info}}
      @onClick={{this.onInfoTableClick}}
    />

    <br />

    {{#if @node.stats.custom}}
      <PaperCard as |card|>
        <card.title as |title|>
          <title.text as |text|>
            <text.headline>Heimdall Schemas</text.headline>
            <text.subhead>Hiemdall Schemas provide additional instrumentation
              for a plugin to provide aggregate timing for a plugin</text.subhead>
          </title.text>
        </card.title>
        <PaperTabs
          @stretch={{true}}
          @borderBottom={{true}}
          @selected={{this.selectedHeimdallCustomSchemaIndex}}
          @onChange={{fn (mut this.selectedHeimdallCustomSchemaIndex)}}
          as |tabs|
        >
          {{#each @node.stats.custom as |custom|}}
            <tabs.tab>
              {{custom.name}}
            </tabs.tab>
          {{/each}}
        </PaperTabs>
        <pre class="m-0"><code
          >{{this.selectedHeimdallCustomSchema.jsonValue}}</code></pre>
      </PaperCard>
    {{else}}
      <EmptyState
        @iconType="note"
        @title="Heimdall Schemas"
        @subtitle={{html
          'To get additional data logged here, please visit <a href="https://github.com/heimdalljs/heimdalljs-lib" target="_blank">https://github.com/heimdalljs/heimdalljs-lib</a> for more information.'
        }}
      />
    {{/if}}

    <br />

    <NodeInfoTimeBreakdown
      @fs={{@node.stats.fs}}
      @selfTime={{@node.buildState.selfTime}}
    />

    <br />

    <div class="layout-row">
      <div class="flex-45">
        <Table
          @title="Input Nodes"
          @data={{this.inputNodeWrappers}}
          @empty="No input node wrappers for this plugin"
        />
      </div>
      <div class="flex-10"></div>
      <div class="flex-45">
        <Table
          @title="Output Nodes"
          @data={{this.outputNodeWrappers}}
          @empty="No output node wrappers for this plugin"
        />
      </div>
    </div>

    <br />

    <Table
      @title="File Input & Outputs"
      @data={{this.files}}
      @empty="No file input or outputs for this plugin"
    />

    <br />
  </template>
}
