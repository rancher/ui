import { get, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access: service(),
  sortBy: null,
  headers: computed('isLocal', function() {
    let out = [
      {
        translationKey: 'generic.name',
        name: 'name',
        sort: ['name'],
        // width: '120'
      },
    ];

    if ( this.get('isLocal') ) {
      out.unshift({
        translationKey: 'accountsPage.index.table.username',
        name: 'username',
        sort: ['username'],
      });
    }

    return out;
  }),

  init() {
    this._super(...arguments);
    set(this, 'sortBy', get(this, 'isLocal') ? 'username' : 'name');
  },

  isLocal: computed('access.provider', function() {
    return true; // TODO 2.0
    // return this.get('access.provider') === 'localauthconfig';
  }),
});
