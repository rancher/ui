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
  queryParams: ['backTo'],
  backTo: null,

  lastRoute: null,

  actions: {
    switchDriver(name) {
      this.replaceRoute('hosts.new.'+name);
    }
  },

  setDefaultDriver: function() {
    this.set('lastRoute','hosts.new.' + defaultDriver);
  }.on('init'),

  drivers: function() {
    var store = this.get('store');
    var has = store.hasRecordFor.bind(store,'schema');

    var actuallyHasNames = Object.keys(store.getById('schema','machine').get('resourceFields')).filter((name) => {
      return name.indexOf('Config') >= 1;
    }).map((name) => {
      return name.toLowerCase();
    });

    return driverChoices.filter((driver) => {
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
