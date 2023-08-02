import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

interface Args {
  systemInfo: SystemInfo;
}

export default class SystemInfo extends Component<Args> {
  @tracked
  selectedIndex = 0;

  get systemInfoKeys() {
    return Object.keys(this.args.systemInfo).filter(
      (key) => key.toUpperCase() !== "__TYPENAME"
    );
  }

  get selectedSystemInfoData() {
    const key = Object.keys(this.args.systemInfo)[this.selectedIndex];

    // gettting the prop of the key we found at the index point
    return (this.args.systemInfo as any)[key];
  }
}
