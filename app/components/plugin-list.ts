import { tracked } from '@glimmer/tracking';
import CollapsableComponent from './collapsable-component';
import { type Node } from 'broccoli-inspector/types';

interface Args {
  nodes: Node[];
}

export default class PluginList extends CollapsableComponent<Args> {
  @tracked
  searchByValue = '';

  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.nodes;
  }

  get nodes() {
    if(this.searchByValue) {
      return this.items.filter(({ label }: { label: string}) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b);
  }
}
