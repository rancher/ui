import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';

export default Component.extend({
  layout,

  showAdvanced: false,

  actions: {
    showAdvanced() {
      set(this, 'showAdvanced', true);
    },
  }
});
