import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  clusterStore: service(),

  _allStorageClasses: null,

  init() {
    this._super(...arguments);
    const clusterStore = get(this, 'clusterStore');

    set(this, '_allStorageClasses', clusterStore.all('storageclass'));
  },

  storageClasses: computed('_allStorageClasses.[]', function() {
    return get(this, '_allStorageClasses').sortBy('name');
  }),

  list: alias('storageClasses'),

  byId(id) {
    return get(this, '_allStorageClasses').findBy('id', id);
  },
});
