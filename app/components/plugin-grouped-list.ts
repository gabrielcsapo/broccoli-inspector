import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class GroupedPluginList extends Component {
  @tracked
  isCollapsed = true;

  @tracked
  searchByValue = '';

  get nodesByType() {
    if(this.searchByValue) {
      return this.args.nodesByType.filter(({ label }) => {
        return label.indexOf(this.searchByValue) > -1;
      });
    }

    return this.args.nodesByType;
  }

  get time() {
    return this.args.nodesByType.map((nodeByType) => nodeByType.time).reduce((a, b) => a + b);
  }

  @action
  uncollapse() {

  }
}
