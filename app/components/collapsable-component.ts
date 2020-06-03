import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CollapsableComponent extends Component {
  @tracked
  isCollapsed = true;

  @tracked
  _items;

  get items() {
    return this._items.slice(0, this.isCollapsed ? 10 : this._items.length);
  }

  @action
  uncollapse() {
    this.isCollapsed = false;
  }
}
