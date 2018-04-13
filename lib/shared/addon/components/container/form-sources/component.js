import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';

export default Component.extend({
  layout,
  sources:     null,
  intl:        service(),
  store:       service('store'),
  statusClass: null,
  fetching:    false,
  editing:     true,

  actions: {
    addSource() {
      let source = {source: 'secret', sourceKey: null};
      get(this, 'sources').addObject(source);
    },
    removeSource(source) {
      get(this, 'sources').removeObject(source);
    },
  },

  init() {
    this._super(...arguments);

    if (!get(this, 'sources') ) {
      set(this, 'sources', [])
    }
  },
});
