import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class NodeList extends Component {
  constructor() {
    super(...arguments);
  }

  get nodes() {
    if(this.args.nodes) {
      return this.args.nodes.sort((nodeA, nodeB) => nodeB.buildState.selfTime - nodeA.buildState.selfTime);
    }

    return []
  }
}
