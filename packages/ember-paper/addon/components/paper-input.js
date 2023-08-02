/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/require-tagless-components, ember/require-computed-property-dependencies, ember/no-component-lifecycle-hooks, ember/no-get, ember/no-actions-hash */
/**
 * @module ember-paper
 */
import { or, bool, and } from '@ember/object/computed';

import Component from '@ember/component';
import { computed, set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { bind, next } from '@ember/runloop';
import { assert } from '@ember/debug';
import layout from '../templates/components/paper-input';
import FocusableMixin from 'ember-paper/mixins/focusable-mixin';
import ColorMixin from 'ember-paper/mixins/color-mixin';
import ChildMixin from 'ember-paper/mixins/child-mixin';
import ValidationMixin from 'ember-paper/mixins/validation-mixin';
import { invokeAction } from 'ember-paper/utils/invoke-action';

/**
 * @class PaperInput
 * @extends Ember.Component
 * @uses FocusableMixin
 * @uses ChildMixin
 * @uses ColorMixin
 * @uses ValidationMixin
 */
export default Component.extend(FocusableMixin, ColorMixin, ChildMixin, ValidationMixin, {
  layout,
  tagName: 'md-input-container',
  classNames: ['md-default-theme'],
  classNameBindings: [
    'hasValue:md-input-has-value',
    'isInvalidAndTouched:md-input-invalid',
    'hasLeftIcon:md-icon-left',
    'hasRightIcon:md-icon-right',
    'focused:md-input-focused',
    'block:md-block',
    'placeholder:md-input-has-placeholder'
  ],
  type: 'text',
  autofocus: false,
  tabindex: null,
  hideAllMessages: false,
  isTouched: false,

  iconComponent: 'paper-icon',

  // override validation mixin `isInvalid` to account for the native input validity
  isInvalid: or('hasErrorMessages', 'isNativeInvalid'),

  hasValue: computed('value', 'isNativeInvalid', function() {
    let value = this.value;
    let isNativeInvalid = this.isNativeInvalid;
    return !isEmpty(value) || isNativeInvalid;
  }),

  shouldAddPlaceholder: computed('label', 'focused', function() {
    // if has label, only add placeholder when focused
    return isEmpty(this.label) || this.focused;
  }),

  inputElementId: computed('elementId', {
    get() {
      return `input-${this.elementId}`;
    },
    // elementId can be set from outside and it will override the computed value.
    // Please check the deprecations for further details
    // https://deprecations.emberjs.com/v3.x/#toc_computed-property-override
    set(key, value) {
      // To make sure the context updates properly, We are manually set value using @ember/object#set as recommended.
      return set(this, "elementId", value);
    }
  }),



  renderCharCount: computed('value', function() {
    let currentLength = this.value ? this.value.length : 0;
    return `${currentLength}/${this.maxlength}`;
  }),

  hasLeftIcon: bool('icon'),
  hasRightIcon: bool('iconRight'),
  isInvalidAndTouched: and('isInvalid', 'isTouched'),

  validationProperty: 'value', // property that validations should be run on

  // Lifecycle hooks
  didReceiveAttrs() {
    this._super(...arguments);
    assert('{{paper-input}} requires an `onChange` action or null for no action.', this.onChange !== undefined);

    let { value, errors } = this;
    let { _prevValue, _prevErrors } = this;
    if (value !== _prevValue || errors !== _prevErrors) {
      this.notifyValidityChange();
    }
    this._prevValue = value;
    this._prevErrors = errors;
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.textarea) {
      this._growTextareaOnResize = bind(this, this.growTextarea);
      window.addEventListener('resize', this._growTextareaOnResize);
    }
  },

  didRender() {
    this._super(...arguments);
    // setValue below ensures that the input value is the same as this.value
    this.setValue(this.value);
    this.growTextarea();
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.textarea) {
      window.removeEventListener('resize', this._growTextareaOnResize);
      this._growTextareaOnResize = null;
    }
  },

  growTextarea() {
    if (this.textarea) {
      let inputElement = this.element.querySelector('input, textarea');
      inputElement.classList.add('md-no-flex');
      inputElement.setAttribute('rows', 1);

      let minRows = this.get('passThru.rows');
      let height = this.getHeight(inputElement);
      if (minRows) {
        if (!this.lineHeight) {
          inputElement.style.minHeight = 0;
          this.lineHeight = inputElement.clientHeight;
          inputElement.style.minHeight = null;
        }
        if (this.lineHeight) {
          height = Math.max(height, this.lineHeight * minRows);
        }
        let proposedHeight = Math.round(height / this.lineHeight);
        let maxRows = this.get('passThru.maxRows') || Number.MAX_VALUE;
        let rowsToSet = Math.min(proposedHeight, maxRows);

        inputElement.style.height = `${this.lineHeight * rowsToSet}px`;
        inputElement.setAttribute('rows', rowsToSet);

        if (proposedHeight >= maxRows) {
          inputElement.classList.add('md-textarea-scrollable');
        } else {
          inputElement.classList.remove('md-textarea-scrollable');
        }

      } else {
        inputElement.style.height = 'auto';
        inputElement.scrollTop = 0;
        let height = this.getHeight(inputElement);
        if (height) {
          inputElement.style.height = `${height}px`;
        }
      }

      inputElement.classList.remove('md-no-flex');
    }
  },

  getHeight(inputElement) {
    let { offsetHeight } = inputElement;
    let line = inputElement.scrollHeight - offsetHeight;
    return offsetHeight + (line > 0 ? line : 0);
  },

  setValue(value) {
    // normalize falsy values to empty string
    value = isEmpty(value) ? '' : value;

    if (this.element.querySelector('input, textarea').value !== value) {
      this.element.querySelector('input, textarea').value = value;
    }
  },

  actions: {
    handleInput(e) {
      invokeAction(this, 'onChange', e.target.value);
      // setValue below ensures that the input value is the same as this.value
      next(() => {
        if (this.isDestroyed) {
          return;
        }
        this.setValue(this.value);
      });
      this.growTextarea();
      let inputElement = this.element.querySelector('input');
      let isNativeInvalid = inputElement && inputElement.validity && inputElement.validity.badInput;
      if (this.type === 'date' && e.target.value === '') {
        // Chrome doesn't fire the onInput event when clearing the second and third date components.
        // This means that we won't see another event when badInput becomes false if the user is clearing
        // the date field.  The reported value is empty, though, so we can already mark it as valid.
        isNativeInvalid = false;
      }
      this.set('isNativeInvalid', isNativeInvalid);
      this.notifyValidityChange();
    },

    handleBlur(e) {
      invokeAction(this, 'onBlur', e);
      this.set('isTouched', true);
      this.notifyValidityChange();
    }
  }
});
