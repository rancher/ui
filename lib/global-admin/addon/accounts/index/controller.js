import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access: service(),
  sortBy: 'name',
  headers: computed('isLocal', function() {
    let out = [
      {
        translationKey: 'generic.name',
        name: 'name',
        sort: ['name'],
        // width: '120'
      },
      {
        translationKey: 'generic.type',
        name: 'type',
        sort: ['type'],
        // width: '120'
      },
    ];

    if ( this.get('isLocal') ) {
      out.push({
        translationKey: 'accountsPage.index.table.username',
        name: 'userName',
        sort: ['userName'],
      });
    }

    return out;
  }),

  isLocal: computed('access.provider', function() {
    return true; // TODO 2.0
    // return this.get('access.provider') === 'localauthconfig';
  }),
});
