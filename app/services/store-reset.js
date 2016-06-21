import Ember from 'ember';
import Service from 'ui/models/service';
import Volume from 'ui/models/volume';
import Snapshot from 'ui/models/snapshot';
import Backup from 'ui/models/backup';

export default Ember.Service.extend({
  reset: function() {
    // Forget all the things
    console.log('Store Reset');
    this.get('userStore').reset();
    this.get('store').reset();

    // Some classes have extra special hackery to cache relationships
    Service.reset();
    Volume.reset();
    Snapshot.reset();
    Backup.reset();
  },
});
