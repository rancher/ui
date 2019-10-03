import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  loading: null,
  error: null,
  value: null,

  init() {
    this._super(...arguments);
  }
});
