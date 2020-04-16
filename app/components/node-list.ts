import Component from "@glimmer/component";

// TODO: you can generate this from the GraphQL queries!
interface Node {
  buildState: {
    selfTime: number;
  };
}

interface Args {
  nodes?: Node[];
}

export default class NodeList extends Component<Args> {
  get nodes() {
    return (
      this.args.nodes?.sort(
        (nodeA, nodeB) => nodeB.buildState.selfTime - nodeA.buildState.selfTime
      ) ?? []
    );
  }
}
