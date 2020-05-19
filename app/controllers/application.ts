import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  queryParams = ['queryContext', 'pluginType'];

  @service
  router;

  @tracked
  queryContext = null;

  @tracked
  pluginType = null;

  @tracked
  isLoading = false;

  get currentRouteName() {
    return this.router.currentRouteName;
  }
}
