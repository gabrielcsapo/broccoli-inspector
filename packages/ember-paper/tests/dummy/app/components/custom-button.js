/* eslint-disable ember/no-classic-components, ember/require-tagless-components, ember/no-actions-hash */
// BEGIN-SNIPPET buttons.component
// app/components/custom-button.js
import Component from '@ember/component';

export default Component.extend({
  actions: {
    targetButton() {
      alert('You pressed a target button. -from component');
    }
  }
});
// END-SNIPPET
