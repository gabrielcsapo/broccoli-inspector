/* eslint-disable ember/no-actions-hash */
import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    toggle(propName) {
      this.toggleProperty(propName);
    }
  }
});