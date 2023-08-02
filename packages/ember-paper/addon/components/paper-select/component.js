/* eslint-disable ember/no-classic-components, ember/no-computed-properties-in-native-classes, ember/no-mixins, ember/no-component-lifecycle-hooks, ember/classic-decorator-no-classic-methods */
import Component from '@ember/component';
import template from './template';

import { tagName, layout } from '@ember-decorators/component';
import { action } from '@ember/object';
import { and } from '@ember/object/computed';
import ChildMixin from 'ember-paper/mixins/child-mixin';

import ValidationMixin from 'ember-paper/mixins/validation-mixin';

import clamp from 'ember-paper/utils/clamp';

const SELECT_EDGE_MARGIN = 8;

function getOffsetRect(node) {
  return node ? {
    left: node.offsetLeft,
    top: node.offsetTop,
    width: node.offsetWidth,
    height: node.offsetHeight
  } : { left: 0, top: 0, width: 0, height: 0 };
}

@tagName('')
@layout(template)
class PaperSelect extends Component.extend(ValidationMixin, ChildMixin) {

  validationProperty = 'selected';
  isTouched = false;
  isFocused = false;

  @and('isInvalid', 'isTouched')
  isInvalidAndTouched;

  @and('isFocused', 'selected')
  isFocusedAndSelected;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.notifyValidityChange();
  }

  @action
  close() {
    this.didAnimateScale = false;
    this.set('isTouched', true);
    this.notifyValidityChange();
  }

  @action
  open() {
    this.didAnimateScale = false;
    this.notifyValidityChange();
  }

  @action
  focus() {
    this.set('isFocused', true);
  }

  @action
  blur() {
    this.set('isFocused', false);
  }

  @action
  calculatePosition(trigger, content) {

    let opts = {
      target: trigger,
      parent: document.body,
      selectEl: content.querySelector('md-select-menu'),
      contentEl: content.querySelector('md-content')
    };

    let containerNode = content;
    let targetNode = opts.target.firstElementChild; // target the label
    let parentNode = opts.parent;
    let selectNode = opts.selectEl;
    let contentNode = opts.contentEl;
    let parentRect = parentNode.getBoundingClientRect();
    let targetRect = targetNode.getBoundingClientRect();
    let shouldOpenAroundTarget = false;
    let bounds = {
      left: parentRect.left + SELECT_EDGE_MARGIN,
      top: SELECT_EDGE_MARGIN,
      bottom: parentRect.height - SELECT_EDGE_MARGIN,
      right: parentRect.width - SELECT_EDGE_MARGIN
    };
    let spaceAvailable = {
      top: targetRect.top - bounds.top,
      left: targetRect.left - bounds.left,
      right: bounds.right - (targetRect.left + targetRect.width),
      bottom: bounds.bottom - (targetRect.top + targetRect.height)
    };
    let maxWidth = parentRect.width - SELECT_EDGE_MARGIN * 2;
    let selectedNode = selectNode.querySelector('md-option[selected]');
    let optionNodes = selectNode.getElementsByTagName('md-option');
    let optgroupNodes = selectNode.getElementsByTagName('md-optgroup');

    let centeredNode, left, top, transformOrigin;

    // If a selected node, center around that
    if (selectedNode) {
      centeredNode = selectedNode;
      // If there are option groups, center around the first option group
    } else if (optgroupNodes.length) {
      centeredNode = optgroupNodes[0];
      // Otherwise, center around the first optionNode
    } else if (optionNodes.length) {
      centeredNode = optionNodes[0];
      // In case there are no options, center on whatever's in there... (eg progress indicator)
    } else {
      centeredNode = contentNode.firstElementChild || contentNode;
    }

    if (contentNode.offsetWidth > maxWidth) {
      contentNode.style['max-width'] = `${maxWidth}px`;
    }
    if (shouldOpenAroundTarget) {
      contentNode.style['min-width'] = `${targetRect.width}px`;
    }

    // Remove padding before we compute the position of the menu

    let focusedNode = centeredNode;
    if ((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
      focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
      centeredNode = focusedNode;
    }

    // Get the selectMenuRect *after* max-width is possibly set above
    containerNode.style.display = 'block';
    let selectMenuRect = selectNode.getBoundingClientRect();
    let centeredRect = getOffsetRect(centeredNode);

    if (centeredNode) {
      let centeredStyle = window.getComputedStyle(centeredNode);
      centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
      centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
    }

    // Get scrollHeight/offsetHeight *after* container is set with display:block
    let isScrollable = contentNode.scrollHeight > contentNode.offsetHeight;
    if (isScrollable) {
      let scrollBuffer = contentNode.offsetHeight / 2;
      contentNode.scrollTop = centeredRect.top + centeredRect.height / 2 - scrollBuffer;

      if (spaceAvailable.top < scrollBuffer) {
        contentNode.scrollTop = Math.min(
          centeredRect.top,
          contentNode.scrollTop + scrollBuffer - spaceAvailable.top
        );
      } else if (spaceAvailable.bottom < scrollBuffer) {
        contentNode.scrollTop = Math.max(
          centeredRect.top + centeredRect.height - selectMenuRect.height,
          contentNode.scrollTop - scrollBuffer + spaceAvailable.bottom
        );
      }
    }

    if (shouldOpenAroundTarget) {
      left = targetRect.left;
      top = targetRect.top + targetRect.height;
      transformOrigin = '50% 0';
      if (top + selectMenuRect.height > bounds.bottom) {
        top = targetRect.top - selectMenuRect.height;
        transformOrigin = '50% 100%';
      }
    } else {
      left = (targetRect.left + centeredRect.left - centeredRect.paddingLeft) + 2;
      top = Math.floor(targetRect.top + targetRect.height / 2 - centeredRect.height / 2
        - centeredRect.top + contentNode.scrollTop) + 2;

      transformOrigin = `${centeredRect.left + targetRect.width / 2}px
        ${centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop}px 0px`;

      containerNode.style.minWidth = `${targetRect.width + centeredRect.paddingLeft
        + centeredRect.paddingRight}px`;
    }

    let containerRect = containerNode.getBoundingClientRect();

    let dropdownTop = clamp(bounds.top, top, bounds.bottom - containerRect.height);
    let dropdownLeft = clamp(bounds.left, left, bounds.right - containerRect.width);

    let scaleX = Math.min(targetRect.width / selectMenuRect.width, 1.0);
    let scaleY = Math.min(targetRect.height / selectMenuRect.height, 1.0);
    let style = {
      top: dropdownTop,
      left: dropdownLeft,
      // Animate a scale out if we aren't just repositioning
      transform: !this.didAnimateScale ? `scale(${scaleX}, ${scaleY})` : undefined,
      'transform-origin': transformOrigin
    };

    this.didAnimateScale = true;

    return { style, horizontalPosition: '', verticalPosition: '' };
  }

}

export default PaperSelect;
