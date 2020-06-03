import { tracked } from '@glimmer/tracking';
import CollapsableComponent from './collapsable-component';

export default class PluginList extends CollapsableComponent {
  @tracked
  searchByValue = '';

  constructor(...args) {
    super(...args);

    this._items = this.args.nodes;
  }

  get nodes() {
    if(this.searchByValue) {
      return this.items.filter(({ label }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b);
  }
}
