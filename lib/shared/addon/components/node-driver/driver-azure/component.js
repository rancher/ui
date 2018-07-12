import { alias } from '@ember/object/computed';
import {
  get, set, computed, observer
} from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import {
  regions, sizes, storageTypes, environments
} from 'ui/utils/azure-choices';

const DRIVER = 'azure';
const CONFIG = 'azureConfig';

export default Component.extend(NodeDriver, {
  layout,
  driverName:      DRIVER,
  model:           null,
  openPorts:       null,
  publicIpChoice:  null,
  publicIpChoices: [
    {
      'name':  'Static',
      'value': 'staticPublicIp=true,noPublicIp=false'
    },
    {
      'name':  'Dynamic',
      'value': 'staticPublicIp=false,noPublicIp=false'
    },
    {
      'name':  'None',
      'value': 'staticPublicIp=true,noPublicIp=true'
    },
  ],
  config: alias(`model.${ CONFIG }`),

  environments:       environments.sortBy('value'),
  sizeChoices:        sizes.sortBy('value'),
  storageTypeChoices: storageTypes.sortBy('name'),

  regionChoices: computed('config.environment', function() {

    let environment = get(this, 'config.environment');

    return regions[environment];

  }),

  privateSet: computed('publicIpChoice', function() {

    let publicIpChoice = get(this, 'publicIpChoice');

    if (publicIpChoice && get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {

      return true;

    }

    return false;

  }),

  setUsePrivateIp: computed('publicIpChoice', function() {

    let publicIpChoice = get(this, 'publicIpChoice');

    if (publicIpChoice && get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {

      return set(this, 'config.usePrivateIp', true);

    }

    return false;

  }),

  evironmentChoiceObserver: observer('config.environment', function() {

    let environment = get(this, 'config.environment');

    set(this, 'config.location', regions[environment][0].name);

  }),

  ipChoiceObserver: observer('publicIpChoice', function() {

    let publicIpChoice = get(this, 'publicIpChoice');

    if (get(this, 'publicIpChoices').findBy('value', publicIpChoice).name === 'None') {

      set(this, 'config.usePrivateIp', true);

    } else {

      set(this, 'config.usePrivateIp', false);

    }

  }),

  publicIpObserver: observer('publicIpChoice', function() {

    let elChoice = get(this, 'publicIpChoice');
    let choice = get(this, 'publicIpChoices').findBy('value', elChoice);

    choice = choice.value.split(',');

    choice.forEach((val) => {

      let tmp = val.split('=');

      set(this, `config.${ tmp[0] }`, tmp[1] === 'true' ? true : false);

    });

  }),

  openPort: observer('openPorts', function() {

    let str = (get(this, 'openPorts') || '').trim();
    let ary = [];

    if (str.length) {

      ary = str.split(/\s*,\s*/);

    }

    set(this, 'config.openPort', ary);

  }),

  init() {

    this._super(...arguments);

    scheduleOnce('afterRender', () => {

      set(this, 'publicIpChoice', this.initPublicIpChoices(get(this, 'config.staticPublicIp'), get(this, 'config.noPublicIp')));
      set(this, 'openPorts', this.initOpenPorts(get(this, 'config.openPort')));

    });

  },

  bootstrap() {

    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      subscriptionId: '',
      clientId:       '',
      clientSecret:   '',
      openPort:       ['6443/tcp', '2379/tcp', '2380/tcp', '8472/udp', '4789/udp', '10256/tcp', '10250/tcp', '10251/tcp', '10252/tcp'],
    });

    set(this, `model.${ CONFIG }`, config);

  },

  initOpenPorts(ports) {

    return ports ? ports.join(',') : '';

  },

  initPublicIpChoices(staticPublicIp, noPublicIp) {

    if (staticPublicIp && noPublicIp) {

      return get(this, 'publicIpChoices').findBy('name', 'None').value;

    } else if (staticPublicIp && !noPublicIp) {

      return get(this, 'publicIpChoices').findBy('name', 'Static').value;

    } else {

      return get(this, 'publicIpChoices').findBy('name', 'Dynamic').value;

    }

  },

  validate() {

    this._super();
    let errors = get(this, 'errors') || [];

    if (!get(this, 'model.name')) {

      errors.push('Name is required');

    }

    if (!get(this, 'config.subscriptionId')) {

      errors.push('Subscription ID is required');

    }

    if (!get(this, 'config.clientId')) {

      errors.push('Client ID is requried');

    }

    if (!get(this, 'config.clientSecret')) {

      errors.push('Client Secret is requried');

    }

    if (errors.length) {

      set(this, 'errors', errors.uniq());

      return false;

    }

    return true;

  },

});
