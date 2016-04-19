import Ember from 'ember';
import DriverChoices from 'ui/utils/driver-choices';

let defaultDriver = 'custom';

// Addon integration hooks
export function getDrivers() {
  return DriverChoices.drivers.slice();
}

export function addDriver(driver) {
  DriverChoices.drivers.push(driver);
}

export function removeDriver(nameOrObj) {
  let name = ( typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj);
  DriverChoices.drivers.removeObjects(DriverChoices.drivers.filterBy('name', name));
}

export function setDefaultDriver(name) {
  defaultDriver = name;
}
// End: Addon integration hooks

export default Ember.Controller.extend({
  queryParams     : ['backTo', 'driver'],
  backTo          : null,
  driver          : null,

  lastRoute       : null,
  apiHostSet      : true,

  setDefaultDriver: function() {
    this.set('lastRoute', `${defaultDriver}`);
  }.on('init'),

  actions: {
    switchDriver(name) {
      this.set('driver', name);
    },
  },

  drivers: function() {
    let store = this.get('store');
    let has = store.hasRecordFor.bind(store,'schema');

    let actuallyHasNames = Object.keys(store.getById('schema','machine').get('resourceFields')).filter((name) => {
      return name.indexOf('Config') >= 1;
    }).map((name) => {
      return name.toLowerCase();
    });

    return DriverChoices.drivers.filter((driver) => {
      Ember.set(driver,'active', `${driver.name}` === this.get('lastRoute'));

      if ( driver.schema ) {
        let name = driver.schema.toLowerCase();
        return has(name) && actuallyHasNames.indexOf(name) >= 0;
      } else {
        return true;
      }
    }).sortBy('sort','label');
  }.property('lastRoute'),
});
