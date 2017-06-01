import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import Flavors from 'ui/utils/rackspace-choices';

let flavorChoices = [];

Flavors.forEach(function(flavor) {
  let parts = flavor.name.match(/^(\d+)\s*([a-z]+)\s*(.*)$/i);
  if ( parts ) {
    let sizeMb = parseInt(parts[1],10);

    if ( parts[2].toLowerCase() === 'gb' ) {
      sizeMb *= 1024;
    }

    flavorChoices.push({
      group  : parts[3],
      label  : parts[3] + ' : ' + parts[1] + ' ' + parts[2],
      value  : flavor.id,
      sizeMb : sizeMb
    });
  }
});

flavorChoices.sort(function(a,b) {
  let ag = a.group;
  let bg = b.group;
  let as = a.sizeMb;
  let bs = b.sizeMb;

  if ( ag < bg ) {
    return -1;
  } else if ( ag > bg ) {
    return 1;
  } else {
    return as - bs;
  }
});

export default Ember.Component.extend(Driver, {
  driverName      : 'rackspace',
  rackspaceConfig : Ember.computed.alias('model.publicValues.rackspaceConfig'),
  flavorChoices   : flavorChoices,
  regionChoices   : [
    {label: 'Dallas (DFW)', value: 'DFW'},
    {label: 'Chicago (ORD)', value: 'ORD'},
    {label: 'Hong Kong (HKG)', value: 'HKG'},
    {label: 'London (LON)', value: 'LON'},
    {label: 'Northern Virginia (IAD)', value: 'IAD'},
    {label: 'Sydney (SYD)', value: 'SYD'},
  ],

  bootstrap: function() {
    let store = this.get('store');

    let config = store.createRecord({
      type: 'rackspaceConfig',
      username: '',
      region: 'DFW',
      flavorId: 'general1-1',
    });

    this.set('model', this.get('store').createRecord({
      type:         'hostTemplate',
      driver:       'rackspace',
      publicValues: {
        rackspaceConfig: config
      },
      secretValues: {
        rackspaceConfig: {
          apiKey: '',
        }
      }
    }));
  },

  validate() {
    let errors = [];

    if ( !this.get('model.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

});
