import Ember from 'ember';
import DriverController from 'ui/hosts/new/driver-controller';
import Regions from './azure-locations';
import vmSizes from './azure-sizes';

var regionChoices = Regions.sortBy('region');
var sizeChoices   = vmSizes.sort();

export default DriverController.extend({
  azureConfig      : Ember.computed.alias('model.azureConfig'),
  regionChoices    : regionChoices,
  sizeChoices      : sizeChoices,
  subscriptionCert : null,

  actions: {
    readFile(field, text) {
      this.set('subscriptionCert', text.trim());
    },
  },

  validate: function() {
    var errors = [];

    if (!this.get('azureConfig.subscriptionId') )
    {
      errors.push('Subscription ID is required');
    }

    if (!this.get('subscriptionCert') )
    {
      errors.push('Subscription Cert is requried');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },


  willSave: function() {
    var validate = this._super(...arguments);

    if (validate) {

      this.set('azureConfig.subscriptionCert', btoa(this.get('subscriptionCert')));

      return validate;
    } else {

      return validate;
    }
  },

});
