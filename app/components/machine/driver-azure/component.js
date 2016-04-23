import Ember from 'ember';
import { regions, sizes } from 'ui/utils/azure-choices';
import Driver from 'ui/mixins/driver';

let regionChoices = regions.sortBy('region');
let sizeChoices   = sizes.sort();

export default Ember.Component.extend(Driver, {
  azureConfig      : Ember.computed.alias('model.azureConfig'),
  regionChoices    : regionChoices,
  sizeChoices      : sizeChoices,
  subscriptionCert : null,
  driverName       : 'azure',
  model            : null,

  bootstrap: function() {
    let config = this.get('store').createRecord({
      type                  : 'azureConfig',
      dockerPort            : '',
      dockerSwarmMasterPort : '',
      image                 : '',
      location              : 'East US',
      password              : '',
      publishSettingsFile   : '',
      size                  : 'ExtraSmall',
      sshPort               : '',
      subscriptionCert      : '',
      subscriptionId        : '',
      username              : '',
    });

    this.set('model', this.get('store').createRecord({
      type: 'machine',
      azureConfig: config,
    }));

    this.set('editing', false);
    this.initFields();
  },

  afterInit: function() {
    this._super(...arguments);

    if (this.get('clonedModel')) {
      this.set('subscriptionCert', atob(this.get('model.azureConfig.subscriptionCert')));
    }
  }.on('init'),

  validate: function() {
    let errors = [];

    if (!this.get('azureConfig.subscriptionId') ) {
      errors.push('Subscription ID is required');
    }

    if (!this.get('subscriptionCert') ) {
      errors.push('Subscription Cert is requried');
    }

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },


  willSave: function() {
    let validate = this._super(...arguments);

    if (validate) {
      this.set('azureConfig.subscriptionCert', btoa(this.get('subscriptionCert')));

      return validate;
    } else {
      return validate;
    }
  },
});
