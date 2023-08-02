import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class CollapsableComponent<
  Args extends {} = {}
> extends Component<Args> {
  @tracked
  isCollapsed = true;

  @tracked
  _items: any;

  get items() {
    return this._items.slice(0, this.isCollapsed ? 10 : this._items.length);
  }

  @action
  uncollapse() {
    this.isCollapsed = false;
  }
}
