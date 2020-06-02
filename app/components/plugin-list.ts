import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PluginList extends Component {
  @tracked
  isCollapsed = true;

  @tracked
  searchByValue = '';

  get nodes() {
    if(this.searchByValue) {
      return this.args.nodes.filter(({ label }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.args.nodes;
  }

  get time() {
    return this.args.nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b);
  }

  @action
  uncollapse() {
    this.isCollapsed = false;
  }
}
