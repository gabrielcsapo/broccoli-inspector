import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SlowestNodes extends Component {
  @tracked
  selectedTab = 0;

  get slowestNodes() {
    return this.args.slowestNodes;
  }

  get table() {
    return {
      header: [
        'ID',
        'Time',
        'Node Label'
      ],
      body: this.slowestNodes.map((slowestNode) => {
        return [
          slowestNode.id,
          Number(slowestNode.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: slowestNode.label,
            linkModel: slowestNode.id,
            linkRoute: 'node'
          }
        ]
      })
    }
  }

  get data() {
    return {
      columns: this.slowestNodes.map((slowestNode) => {
        return [slowestNode.label, slowestNode.buildState.selfTime]
      }),
      type: "bar"
    }
  }
}
