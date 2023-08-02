import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

import { Node } from "broccoli-inspector/types";

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
      header: ["ID", "Time", "Node Label"],
      body: this.slowestNodes.map((slowestNode) => {
        return [
          slowestNode.id,
          Number(slowestNode.buildState.selfTime).toFixed(3) + "ms",
          {
            text: slowestNode.label,
            linkModel: slowestNode.id,
            linkRoute: "node",
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
      type: "bar",
    };
  }
}
