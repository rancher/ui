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
  queryParams: ['backTo'],
  backTo: null,

  lastRoute: null,
  apiHostSet: true,

  actions: {
    switchDriver(name) {
      this.replaceRoute('hosts.new.'+name);
    }
  },

  setDefaultDriver: function() {
    this.set('lastRoute','hosts.new.' + defaultDriver);
  }.on('init'),

  drivers: function() {
    let store = this.get('store');
    let has = store.hasRecordFor.bind(store,'schema');

    var actuallyHasNames = Object.keys(store.getById('schema','machine').get('resourceFields')).filter((name) => {
      return name.indexOf('Config') >= 1;
    }).map((name) => {
      return name.toLowerCase();
    });

    return DriverChoices.drivers.filter((driver) => {
      Ember.set(driver,'active', 'hosts.new.'+driver.name === this.get('lastRoute'));

      if ( driver.schema ) {
        var name = driver.schema.toLowerCase();
        return has(name) && actuallyHasNames.indexOf(name) >= 0;
      } else {
        return true;
      }
    }).sortBy('sort','label');
  }.property('lastRoute'),
});
