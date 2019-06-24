import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  classNames: ['outside-click'],

  onOutsideClick: null,

  layout,
  isOutside: false,

  init() {
    this._super(...arguments);
    this._boundHandleDown = this.handleDown.bind(this);
    this._boundHandleUp = this.handleUp.bind(this);
  },

  didInsertElement() {
    this._super(...arguments);
    document.addEventListener('mousedown', this._boundHandleDown, true);
    document.addEventListener('mouseup', this._boundHandleUp, true);
  },

  willDestroyElement() {
    this._super(...arguments);
    document.removeEventListener('mousedown', this._boundHandleDown, true);
    document.removeEventListener('mouseup', this._boundHandleUp, true);
  },

  handleDown(e) {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    if (!this.element.contains(e.target)) {
      this.set('isOutside', true);
    }
  },

  handleUp(e) {
    if (this.get('isOutside')) {
      if (this.onOutsideClick) {
        this.onOutsideClick(e);
      }
    }

    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    this.set('isOutside', false);
  }
})
