/* eslint-disable ember/no-actions-hash */
import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  actions: {
    toggleExpandedItem(value, ev) {
      if (this.expandedItem === value) {
        value = null;
      }
      this.set('expandedItem', value);
      ev.stopPropagation();
    }
  },

  expandedItem: computed('currentRouteName', function() {
    if (this.currentRouteName.substr(0, 6) === 'layout') {
      return 'layout';
    } else {
      return 'demos';
    }
  }),

  demosExpanded: equal('expandedItem', 'demos'),
  layoutExpanded: equal('expandedItem', 'layout')
});
