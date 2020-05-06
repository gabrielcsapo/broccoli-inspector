import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class NodeController extends Controller {
  queryParams = ['filePath', 'column', 'line'];

  @service
  router;

  @tracked
  filePath = null;

  @tracked
  column = null;

  @tracked
  line = null;

  @action
  close() {
    this.router.transitionTo('node', this.router.currentRoute.parent.params.id, {
      queryParams: {}
    });
  }

  get fileLines() {
    return this.model.file.split('\n').map((fileLine, index) => {
      if(index === parseInt(this.line) - 1) {
        return htmlSafe(`<mark>${fileLine}</mark>`);
      }

      return fileLine;
    });
  }
}
