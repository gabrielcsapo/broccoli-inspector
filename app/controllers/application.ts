import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface DOMEvent {
  target: {
    value: string
  }
}

export default class ApplicationController extends Controller {
  queryParams = ['searchTerm', 'groupPlugins', 'pluginType'];

  @tracked
  groupPlugins = true;

  @tracked
  searchTerm = null;

  @tracked
  pluginType = null;

  @action
  search(e: DOMEvent) {
    this.searchTerm = e.target.value;
    this.groupPlugins = false;
    this.pluginType = null;
  }

  @action
  toggleGroupingPlugins() {
    this.groupPlugins = !this.groupPlugins;
  }

  @action
  selectPluginGroup(type) {
    this.pluginType = type;
  }
}
