import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { Node } from "types";

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  get info() {
    const node = this.args.node;
    const nodeInfo = node?.nodeInfo || {};

    return {
      header: [
        "Property", "Value"
      ],
      body: Object.keys(nodeInfo)
        .filter((prop) => prop.indexOf('__') === -1)
        .map((prop) => {
          if(prop === 'instantiationStack') {
            return [prop, {
              tag: 'pre',
              text: nodeInfo[prop]
            }]
          }

          return [prop, nodeInfo[prop]]
        })
    }
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
        return [key, `${time / 1000000}ms`, count];
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
