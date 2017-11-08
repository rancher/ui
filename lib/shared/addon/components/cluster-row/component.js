import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:    null,
  tagName:  '',
  expanded: null,

  actions: {
    toggle() {
      this.sendAction('toggle');
    },

    switchToProject(id) {
      // @TODO bad
      window.lc('authenticated').send('switchProject', id);
    }
  },
});
