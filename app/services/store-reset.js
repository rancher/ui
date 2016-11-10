import Ember from 'ember';
import Backup from 'ui/models/backup';
import Mount from 'ui/models/mount';
import Snapshot from 'ui/models/snapshot';
import Volume from 'ui/models/volume';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  catalog: Ember.inject.service(),

  reset: function() {
    // Forget all the things
    console.log('Store Reset');
    this.get('userStore').reset();
    this.get('store').reset();
    this.get('catalog').reset();

    // Some classes have extra special hackery to cache relationships
    Backup.reset();
    Mount.reset();
    Snapshot.reset();
    Volume.reset();
  },
});
