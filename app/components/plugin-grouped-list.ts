import CollapsableComponent from './collapsable-component';
import { tracked } from '@glimmer/tracking';

export default class GroupedPluginList extends CollapsableComponent {
  @tracked
  searchByValue = '';

  constructor(...args) {
    super(...args);

    this._items = this.args.nodesByType;
  }

  get nodesByType() {
    if(this.searchByValue) {
      return this.items.filter(({ label }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodesByType.map((nodeByType) => nodeByType.time).reduce((a, b) => a + b);
  }
}
