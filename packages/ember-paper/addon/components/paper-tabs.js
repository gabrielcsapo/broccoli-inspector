/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-classic-components, ember/no-mixins, ember/no-component-lifecycle-hooks, ember/classic-decorator-no-classic-methods, ember/no-get */
import { classNames, attributeBindings, tagName, layout as templateLayout } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { gt } from '@ember/object/computed';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { scheduleOnce, join } from '@ember/runloop';
import layout from '../templates/components/paper-tabs';
import { ParentMixin } from 'ember-composability-tools';
import ColorMixin from 'ember-paper/mixins/color-mixin';
import { invokeAction } from 'ember-paper/utils/invoke-action';

@templateLayout(layout)
@tagName('md-tabs')
@classNames('md-no-tab-content', 'md-default-theme')
@attributeBindings('borderBottom:md-border-bottom')
export default class PaperTabs extends Component.extend(ParentMixin, ColorMixin) {
  @service
  constants;

  selected = 0; // select first tab by default
  noInkBar = false;
  noInk = false;
  ariaLabel = null;
  stretch = 'sm';
  movingRight = true;

  @computed('noInkBar', '_selectedTab.{width,left}', 'wrapperWidth')
  get inkBar() {
    if (this.noInkBar) {
      return null;
    }

    let selectedTab = this._selectedTab;
    if (!selectedTab || selectedTab.get('left') === undefined) {
      return null;
    }

    return {
      left: selectedTab.get('left'),
      right: this.wrapperWidth - selectedTab.get('left') - selectedTab.get('width')
    };
  }

  @computed('currentOffset')
  get paginationStyle() {
    return htmlSafe(`transform: translate3d(-${this.currentOffset}px, 0px, 0px);`);
  }

  shouldPaginate = true;

  @computed('shouldPaginate', 'center')
  get shouldCenter() {
    return !this.shouldPaginate && this.center;
  }

  @computed('shouldPaginate', 'currentStretch')
  get shouldStretch() {
    return !this.shouldPaginate && this.currentStretch;
  }

  didInsertElement() {
    super.didInsertElement(...arguments);

    this.updateCanvasWidth = () => {
      join(() => {
        this.updateDimensions();
        this.updateStretchTabs();
      });
    };

    window.addEventListener('resize', this.updateCanvasWidth);
    window.addEventListener('orientationchange', this.updateCanvasWidth);

    scheduleOnce('afterRender', this, this.fixOffsetIfNeeded);
  }

  didRender() {
    super.didRender(...arguments);
    // this makes sure that the tabs react to stretch and center changes
    // this method is also called whenever one of the tab is re-rendered (content changes)
    this.updateSelectedTab();
    this.updateCanvasWidth();
  }

  /**
   * Updates the currently selected tab only once all the <paper-tab> has rendered.
   *
   * If we were to use a computed property the observer would get triggered once per
   * nested <paper-tab> because we pass the 'selected' property to them that will
   * invalidate their 'isSelected' property.
   */
  updateSelectedTab() {
    let selectedTab = this.childComponents.findBy('isSelected');
    let previousSelectedTab = this._selectedTab;

    if (selectedTab === previousSelectedTab) {
      return;
    }

    this.set('movingRight', !selectedTab || !previousSelectedTab || previousSelectedTab.get('left') < selectedTab.get('left'));
    this.set('_selectedTab', selectedTab);

    scheduleOnce('afterRender', this, this.fixOffsetIfNeeded);
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    window.removeEventListener('resize', this.updateCanvasWidth);
    window.removeEventListener('orientationchange', this.updateCanvasWidth);
  }

  registerChild(childComponent) {
    super.registerChild(...arguments);
    // automatically set value if not manually set
    if (childComponent.get('value') === undefined) {
      let length = this.childComponents.get('length');
      childComponent.set('value', length - 1);
    }
  }

  fixOffsetIfNeeded() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    let canvasWidth = this.canvasWidth;
    let currentOffset = this.currentOffset;

    let tabLeftOffset = this.get('_selectedTab.left');
    let tabRightOffset = tabLeftOffset + this.get('_selectedTab.width');

    let newOffset;
    if (canvasWidth < this.get('_selectedTab.width')) {
      // align with selectedTab if canvas smaller than selected tab
      newOffset = tabLeftOffset;
    } else if (tabRightOffset - currentOffset > canvasWidth) {
      // ensure selectedTab is not partially hidden on the right side
      newOffset = tabRightOffset - canvasWidth;
    } else if (tabLeftOffset < currentOffset) {
      // ensure selectedTab is not partially hidden on the left side
      newOffset = tabLeftOffset;
    } else {
      newOffset = currentOffset;
    }

    if (newOffset === currentOffset) {
      return;
    }

    this.set('currentOffset', newOffset);
  }

  updateDimensions() {
    let canvasWidth = this.element.querySelector('md-tabs-canvas').offsetWidth;
    let wrapperWidth = this.element.querySelector('md-pagination-wrapper').offsetWidth;
    this.childComponents.invoke('updateDimensions');
    this.set('canvasWidth', canvasWidth);
    this.set('wrapperWidth', wrapperWidth);
    this.set('shouldPaginate', wrapperWidth > canvasWidth);
  }

  updateStretchTabs() {
    let stretch = this.stretch;
    let currentStretch;

    // if `true` or `false` is specified, always/never "stretch tabs"
    // otherwise proceed with normal matchMedia test
    if (typeof stretch === 'boolean') {
      currentStretch = stretch;
    } else {
      let mediaQuery = this.constants.MEDIA[stretch] || stretch;
      currentStretch = window.matchMedia(mediaQuery).matches;
    }

    this.set('currentStretch', currentStretch);
  }

  currentOffset = 0;

  @gt('currentOffset', 0)
  canPageBack;

  @computed('wrapperWidth', 'currentOffset', 'canvasWidth')
  get canPageForward() {
    return this.wrapperWidth - this.currentOffset > this.canvasWidth;
  }

  @action
  previousPage() {
    let tab = this.childComponents.find((t) => {
      // ensure we are no stuck because of a tab with a width > canvasWidth
      return (t.get('left') + t.get('width')) >= this.currentOffset;
    });
    if (tab) {
      let left = Math.max(0, tab.get('left') - this.canvasWidth);
      this.set('currentOffset', left);
    }
  }

  @action
  nextPage() {
    let tab = this.childComponents.find((t) => {
      // ensure tab's offset is greater than current
      // otherwise if the tab's width is greater than canvas we cannot paginate through it
      return t.get('left') > this.currentOffset
        // paginate until the first partially hidden tab
        && t.get('left') + t.get('width') - this.currentOffset > this.canvasWidth;
    });
    if (tab) {
      this.set('currentOffset', tab.get('left'));
    }
  }

  @action
  localOnChange(selected) {
    // support non DDAU scenario
    if (this.onChange) {
      invokeAction(this, 'onChange', selected.get('value'));
    } else {
      this.set('selected', selected.get('value'));
    }
  }
}
