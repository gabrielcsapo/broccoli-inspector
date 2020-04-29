import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  queryParams = ['query'];

  @tracked
  query = null;
}
