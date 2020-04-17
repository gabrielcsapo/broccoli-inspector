import Component from "@glimmer/component";
import { action } from '@ember/object';

// TODO: you can generate this from the GraphQL queries!
interface Node {
  buildState: {
    selfTime: number;
  };
}

interface Args {
  nodes?: Node[];
}

interface DOMEvent {
  target: {
    value: string
  }
}

export default class NodeList extends Component<Args> {
  @action
  searchNode(e: DOMEvent) {
    window.location.search = `?searchTerm=${e.target.value}`;
  }


  get nodes() {
    return (
      this.args.nodes?.sort(
        (nodeA, nodeB) => nodeB.buildState.selfTime - nodeA.buildState.selfTime
      ) ?? []
    );
  }
}
