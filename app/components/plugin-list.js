import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class PluginList extends Component {
  constructor() {
    super(...arguments);
  }

  get totalTime() {
    if(this.args.plugins) {
      return this.args.plugins.map((plugin) => plugin.buildState.selfTime).reduce((a, b) => a + b)
    }
    return 0;
  }

  get sortedPlugins() {
    if(this.args.plugins) {
      return this.args.plugins
        .sort((pluginA, pluginB) => pluginB.buildState.selfTime - pluginA.buildState.selfTime);
    }
  }
}
