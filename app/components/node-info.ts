import Component from "@glimmer/component";
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Node } from "types";

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  @service
  router;

  get info() {
    const node = this.args.node;
    const nodeInfo = node?.nodeInfo || {};

    return {
      header: [
        "Property", "Value"
      ],
      body: Object.keys(nodeInfo)
        .filter((prop) => prop.indexOf('__') === -1 && prop !== 'instantiationStack')
        .map((prop) => [prop, nodeInfo[prop]])
    }
  }

  @action
  onInfoTableClick(e) {
    e.stopPropagation();
    e.preventDefault();

    if(e.target && e.target.dataset['filePath']) {
      const { filePath, line, column } = e.target.dataset;

      this.router.transitionTo('node.file', this.args.node.id, {
        queryParams: { filePath: encodeURI(filePath), line, column }
      });
    }

    return false;
  }

  get inputNodeWrappers() {
    const node = this.args.node;
    const inputNodeWrappers = node?.inputNodeWrappers || [];

    return {
      header: [
        'ID',
        'Time',
        'Node Label'
      ],
      body: inputNodeWrappers.map((inputNodeWrapper) => {
        return [
          inputNodeWrapper.id,
          Number(inputNodeWrapper.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: inputNodeWrapper.label,
            linkModel: inputNodeWrapper.id,
            linkRoute: 'node'
          }
        ]
      })
    }
  }

  get outputNodeWrappers() {
    const node = this.args.node;
    const outputNodeWrappers = node?.outputNodeWrappers || [];

    return {
      header: [
        'ID',
        'Time',
        'Node Label'
      ],
      body: outputNodeWrappers.map((outputNodeWrapper) => {
        return [
          outputNodeWrapper.id,
          Number(outputNodeWrapper.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: outputNodeWrapper.label,
            linkModel: outputNodeWrapper.id,
            linkRoute: 'node'
          }
        ]
      })
    }
  }

  get fs() {
    const node = this.args.node;
    const fs = node?.stats?.fs || {};

    const body = Object.keys(fs)
      .filter((key) => {
        const item = fs[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = fs[keyA];
        const rowB = fs[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = fs[key];
        // time is ns and we want to convert to ms
        return [key, { raw: time, text: `${time / 1000000}ms` }, count];
      });

    return {
      header: [
        `Operation`,
        `Time`,
        `Count`
      ],
      body
    }
  }

  get files() {
    const body = [];
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];
    const tableHeight = Math.max(inputFiles.length, outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      body.push([inputFiles[i], outputFiles[i]])
    }

    return {
      header: [
        `Input Files (${inputFiles.length})`,
        `Output Files (${outputFiles.length})`
      ],
      body
    };
  }
}
