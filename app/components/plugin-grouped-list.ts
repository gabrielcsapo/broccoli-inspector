import CollapsableComponent from "./collapsable-component";
import { tracked } from "@glimmer/tracking";

import { NodesByType } from "broccoli-inspector/types";

interface Args {
  nodesByType: NodesByType[];
}

export default class GroupedPluginList extends CollapsableComponent<Args> {
  @tracked
  searchByValue = "";

  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.nodesByType;
  }

  get nodesByType() {
    if (this.searchByValue) {
      return this.items.filter(({ label }: { label: string }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.items;
  }

  get time() {
    return this.args.nodesByType
      .map((nodeByType) => nodeByType.time)
      .reduce((a, b) => a + b);
  }
}
