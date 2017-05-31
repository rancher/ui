import Ember from 'ember';
import { regions, sizes, storageTypes, environments } from 'ui/utils/azure-choices';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  azureConfig      : Ember.computed.alias('model.publicValues.azureConfig'),
  environments     : environments.sortBy('value'),
  sizeChoices      : sizes.sortBy('value'),
  driverName       : 'azure',
  model            : null,
  openPorts        : null,
  publicIpChoice   : null,
  publicIpChoices  : [
    {
      'name': 'Static',
      'value': 'staticPublicIp=true,noPublicIp=false'
    },
    {
      'name': 'Dynamic',
      'value': 'staticPublicIp=false,noPublicIp=false'
    },
    {
      'name': 'None',
      'value': 'staticPublicIp=true,noPublicIp=true'
    },
  ],
  storageTypeChoices: storageTypes.sortBy('name'),

  bootstrap: function() {
    let config = this.get('store').createRecord({
      type             : 'azureConfig',
      subscriptionId   : '',
      clientId         : '',
      openPort         : ['500/udp','4500/udp'],
    });

    this.set('model', this.get('store').createRecord({
      type:         'hostTemplate',
      driver:       'azure',
      publicValues: {
        azureConfig: config
      },
      secretValues: {
        azureConfig: {
          clientSecret     : '',
        }
      }
    }));

    this.set('editing', false);
  },

  init() {
    this._super(...arguments);

    Ember.run.scheduleOnce('afterRender', () => {
      this.set('publicIpChoice', this.initPublicIpChoices(this.get('azureConfig.staticPublicIp'), this.get('azureConfig.noPublicIp')));
      this.set('openPorts', this.initOpenPorts(this.get('azureConfig.openPort')));
    });
  },

  initOpenPorts: function(ports) {
    return ports ? ports.join(',') : '';
  },

  initPublicIpChoices: function(staticPublicIp, noPublicIp) {
    if (staticPublicIp && noPublicIp) {
      return this.get('publicIpChoices').findBy('name', 'None').value;
    } else if (staticPublicIp && !noPublicIp) {
      return this.get('publicIpChoices').findBy('name', 'Static').value;
    } else {
      return this.get('publicIpChoices').findBy('name', 'Dynamic').value;
    }
  },

  regionChoices: Ember.computed('azureConfig.environment', function() {
      let environment = this.get('azureConfig.environment');
      return regions[environment];
  }),

  evironmentChoiceObserver: Ember.observer('azureConfig.environment', function() {
      let environment = this.get('azureConfig.environment');
      this.set('azureConfig.location', regions[environment][0].name);
  }),

  privateSet: Ember.computed('publicIpChoice', function() {
      let publicIpChoice = this.get('publicIpChoice');
      if (publicIpChoice && this.get('publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
        return true;
      }
      return false;
  }),

  ipChoiceObserver: Ember.observer('publicIpChoice', function() {
      let publicIpChoice = this.get('publicIpChoice');
      if (this.get('publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
        this.set('azureConfig.usePrivateIp', true);
      } else {
        this.set('azureConfig.usePrivateIp', false);
      }
  }),

  setUsePrivateIp: Ember.computed('publicIpChoice', function() {
      let publicIpChoice = this.get('publicIpChoice');
      if (publicIpChoice && this.get('publicIpChoices').findBy('value', publicIpChoice).name === 'None') {
        return this.set('azureConfig.usePrivateIp', true);
      }
      return false;
  }),

  publicIpObserver: Ember.observer('publicIpChoice', function() {
    let elChoice = this.get('publicIpChoice');
    let choice = this.get('publicIpChoices').findBy('value', elChoice);

    choice = choice.value.split(',');

    choice.forEach((val) => {
      let tmp = val.split('=');
      this.set(`azureConfig.${tmp[0]}`, tmp[1] === 'true' ? true : false);
    });

  }),

  openPort: Ember.observer('openPorts', function() {
    let str = (this.get('openPorts')||'').trim();
    let ary = [];
    if ( str.length ) {
      ary = str.split(/\s*,\s*/);
    }

    this.set('azureConfig.openPort', ary);
  }),

  validate: function() {
    let errors = [];

    this.set('prefix',(this.get('prefix')||'').toLowerCase());
    let name = this.get('model.name');
    if ( name.length < 4 || name.length > 62 ) {
      errors.push('Name must be between 4 and 62 characters long');
    }

    if ( name.match(/[^a-z0-9-]/) ) {
      errors.push('Name can only contain a-z, 0-9, and hyphen');
    }

    if (!this.get('azureConfig.subscriptionId') ) {
      errors.push('Subscription ID is required');
    }

    if (!this.get('azureConfig.clientId') ) {
      errors.push('Client ID is requried');
    }

    if (!this.get('model.secretValues.azureConfig.clientSecret') ) {
      errors.push('Client Secret is requried');
    }

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

});
