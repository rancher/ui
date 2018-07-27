import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { computed } from '@ember/object';

export default Service.extend({
  globalStore:   service(),

  _allRoleTemplates: null,

  init() {
    this._super(...arguments);

    set(this, '_allRoleTemplates', get(this, 'globalStore').all('roleTemplate'));
    get(this, 'globalStore').find('roleTemplate');
  },

  fetchFilteredRoleTemplates(id = null, opts = {
    filter: {
      locked: false,
      hidden: false
    }
  }) {
    const store = get(this, 'globalStore');

    return store.find('roleTemplate', id, opts);
  },

  allFilteredRoleTemplates: computed('_allRoleTemplates.@each.{locked,hidden}', function() {
    return get(this, '_allRoleTemplates').filter( (rt) => !get(rt, 'locked') && !get(rt, 'hidden'));
  }),

  allVisibleRoleTemplates: computed('_allRoleTemplates.@each.{locked,hidden}', function() {
    return get(this, '_allRoleTemplates').filter( (rt) => !get(rt, 'hidden'));
  }),

});
