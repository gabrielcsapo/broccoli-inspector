import CollapsableComponent from './collapsable-component';

export default class BuildsList extends CollapsableComponent {
  constructor(...args) {
    super(...args);

    this._items = this.args.builds;
  }

  get builds() {
    return this.items;
  }
}
