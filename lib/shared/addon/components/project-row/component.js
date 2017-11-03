import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  model:       null,
  tagName:     'TR',
  showCluster: false,
  projects:    service(),

  actions: {
    switchTo(id) {
      // @TODO bad
      window.lc('authenticated').send('switchProject', id);
    }
  },
});
