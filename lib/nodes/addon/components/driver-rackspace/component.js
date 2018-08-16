import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import Flavors from 'ui/utils/rackspace-choices';
import layout from './template';

let flavorChoices = [];

Flavors.forEach((flavor) => {
  let parts = flavor.name.match(/^(\d+)\s*([a-z]+)\s*(.*)$/i);

  if ( parts ) {
    let sizeMb = parseInt(parts[1], 10);

    if ( parts[2].toLowerCase() === 'gb' ) {
      sizeMb *= 1024;
    }

    flavorChoices.push({
      group:  parts[3],
      label:  `${ parts[3]  } : ${  parts[1]  } ${  parts[2] }`,
      value:  flavor.id,
      sizeMb
    });
  }
});

flavorChoices.sort((a, b) => {
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

export default Component.extend(NodeDriver, {
  layout,
  driverName:    'rackspace',
  flavorChoices,
  regionChoices: [
    {
      label: 'Dallas (DFW)',
      value: 'DFW'
    },
    {
      label: 'Chicago (ORD)',
      value: 'ORD'
    },
    {
      label: 'Hong Kong (HKG)',
      value: 'HKG'
    },
    {
      label: 'London (LON)',
      value: 'LON'
    },
    {
      label: 'Northern Virginia (IAD)',
      value: 'IAD'
    },
    {
      label: 'Sydney (SYD)',
      value: 'SYD'
    },
  ],

  config: alias('model.rackspaceConfig'),
  bootstrap() {
    let store = this.get('globalStore');

    let config = store.createRecord({
      type:     'rackspaceConfig',
      username: '',
      apiKey:   '',
      region:   'DFW',
      flavorId: 'general1-2',
    });

    this.set('model.rackspaceConfig', config);
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
