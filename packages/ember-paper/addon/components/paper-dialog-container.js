/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
/**
 * @module ember-paper
 */
import Component from '@ember/component';
import { invokeAction } from 'ember-paper/utils/invoke-action';

/**
 * @class PaperDialogContainer
 * @extends Ember.Component
 */
export default Component.extend({
  classNames: ['md-dialog-container'],

  mouseDown(ev) {
    this._sourceEl = ev.target;
  },

  mouseUp(ev) {
    if (this._sourceEl === this.element && ev.target === this.element) {
      ev.stopPropagation();
      ev.preventDefault();
      invokeAction(this, 'outsideClicked');
    }
  }
});
