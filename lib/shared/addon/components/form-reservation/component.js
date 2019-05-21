import Component from '@ember/component';
import layout from './template';
import { set, get, setProperties } from '@ember/object';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);
  },
});
