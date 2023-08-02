import { NodesByType } from "broccoli-inspector/types";
import CollapsableComponent from "./collapsable-component";

type Args = {
  builds: NodesByType;
};

export default class BuildsList extends CollapsableComponent<Args> {
  constructor(...args: any) {
    // @ts-ignore
    super(...args);

    this._items = this.args.builds;
  }

  get builds() {
    return this.items;
  }
}
