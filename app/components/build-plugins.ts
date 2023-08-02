import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { type Node } from "broccoli-inspector/types";

interface Args {
  nodes?: Node[];
}

export default class BuildPlugins extends Component<Args> {
  @tracked
  selectedTab = 0;

  get nodes() {
    const nodes = this.args?.nodes || [];

    const body = nodes
      .map((node) => {
        return [node.id, {
          text: node.label,
          linkModel: node.id,
          linkRoute: 'node'
        }, { raw: node.buildState.selfTime, text: `${node.buildState.selfTime}ms` }];
      });

    return {
      header: [
        `ID`,
        `Label`,
        `Time`
      ],
      body
    }
  }

  get axis() {
    return {
      x: {
        type: 'category'
      }
    }
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
          selfTime: node.buildState.selfTime
        };
      });

    return {
      json,
      keys: {
        x: 'label',
        value: ['selfTime'],
      },
      type: 'bar'
    }
  }
}
