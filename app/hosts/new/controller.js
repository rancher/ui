import Ember from 'ember';

var defaultDriver = 'custom';
var driverChoices = [
  {name: 'custom',       label: 'Custom',        css: 'custom',       sort: 1,                              },
  {name: 'amazonec2',    label: 'Amazon EC2',    css: 'amazon',       sort: 2, schema: 'amazonec2config'    },
  {name: 'azure',        label: 'Azure',         css: 'azure',        sort: 2, schema: 'azureConfig'        },
  {name: 'digitalocean', label: 'DigitalOcean',  css: 'digitalocean', sort: 2, schema: 'digitaloceanconfig' },
  {name: 'exoscale',     label: 'Exoscale',      css: 'exoscale',     sort: 2, schema: 'exoscaleconfig'     },
  {name: 'packet',       label: 'Packet',        css: 'packet',       sort: 2, schema: 'packetconfig'       },
  {name: 'rackspace',    label: 'RackSpace',     css: 'rackspace',    sort: 2, schema: 'rackspaceconfig'    },
  {name: 'ubiquity',     label: 'Ubiquity',      css: 'ubiquity',     sort: 2, schema: 'ubiquityconfig'     },
  {name: 'other',        label: 'Other',         css: 'other',        sort: 3,                              },
];

// Addon integration hooks
export function getDrivers() {
  return driverChoices.slice();
}

export function addDriver(driver) {
  driverChoices.push(driver);
}

export function removeDriver(nameOrObj) {
  var name = ( typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj);
  driverChoices.removeObjects(driverChoices.filterBy('name', name));
}

export function setDefaultDriver(name) {
  defaultDriver = name;
}
// End: Addon integration hooks

export default Ember.Controller.extend({
  lastRoute: null,

  setDefaultDriver: function() {
    this.set('lastRoute','hosts.new.' + defaultDriver);
  }.on('init'),

  drivers: function() {
    var store = this.get('store');
    var has = store.hasRecordFor.bind(store,'schema');

    return driverChoices.filter((driver) => {
      if ( driver.schema ) {
        return has(driver.schema.toLowerCase());
      } else {
        return true;
      }
    }).sortBy('sort','label');
  }.property(),
});
