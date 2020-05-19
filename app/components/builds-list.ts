import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BuildsList extends Component {
  @tracked
  isCollapsed = true;

  get builds() {
    return this.args.builds;
  }

  @action
  uncollapse() {
    this.isCollapsed = false;
  }
}
