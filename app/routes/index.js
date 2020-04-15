import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service('socket-io') socketIO;

  constructor() {
    super(...arguments);

    const socket = this.socketIO.socketFor(`http://localhost:4200`);

    socket.on('beginNode', this.beginNode, this);
    socket.on('endNode', this.endNode, this);

    this.set('plugins', {});
  }

  endNode(data) {
    const { id } = data;

    console.log(data)

    const plugins = this.get('plugins');

    plugins[id] = data;

    this.set('plugins', plugins);
    this.controller.set('plugins', Object.entries(plugins).map(([key, value]) => value));
  }

  beginNode(data) {
    const { label, id } = data;

    this.controller.set('currentNode', label);

    const plugins = this.get('plugins');

    plugins[id] = data;

    this.set('plugins', plugins);
    this.controller.set('plugins', Object.entries(plugins).map(([key, value]) => value));
  }
}
