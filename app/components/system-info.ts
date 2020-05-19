import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SystemInfo extends Component {
  @tracked
  selectedIndex = 0;

  get systemInfoKeys() {
    return Object.keys(this.args.systemInfo).filter((key) => key.toUpperCase() !== '__TYPENAME');
  }

  get selectedSystemInfoData() {
    const key = Object.keys(this.args.systemInfo)[this.selectedIndex];

    return this.args.systemInfo[key];
  }
}
