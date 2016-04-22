import Ember from 'ember';
import DriverChoices from 'ui/utils/driver-choices';

export default Ember.Controller.extend({
  queryParams : ['backTo', 'driver', 'machineId'],
  backTo      : null,
  driver      : null,

  lastRoute   : null,
  apiHostSet  : true,
  clonedModel : null,
  machineId   : null,

  actions: {
    switchDriver(name) {
      if (this.get('machineId')) {
        this.setProperties({
          machineId: null,
          clonedModel: null
        });
      }
      this.set('driver', name);
    },
  },

  onInit: function() {
    this.set('lastRoute', DriverChoices.getDefault());
  }.on('init'),


  drivers: function() {
    let store = this.get('store');
    let has = store.hasRecordFor.bind(store,'schema');

    let actuallyHaveNames = Object.keys(store.getById('schema','machine').get('resourceFields')).filter((name) => {
      return !!name.match(/.+Config$/);
    }).map((name) => {
      return name.toLowerCase();
    });

    return DriverChoices.get().filter((driver) => {
      Ember.set(driver,'active', `${driver.name}` === this.get('lastRoute'));

      if ( driver.schema ) {
        let name = driver.schema.toLowerCase();
        return has(name) && actuallyHaveNames.indexOf(name) >= 0;
      } else {
        return true;
      }
    }).sortBy('sort','label');
  }.property('lastRoute'),
});
