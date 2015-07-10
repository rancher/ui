import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditTargetIp from 'ui/mixins/edit-targetip';

export default Ember.ObjectController.extend(Cattle.LegacyNewOrEditMixin, EditTargetIp, {
  queryParams: ['environmentId','serviceId'],
  environmentId: null,
  serviceId: null,
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.service'),

  validate: function() {
    var errors = [];
    if ( !this.get('service.externalIpAddresses.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }
    else
    {
      this._super();
      errors = this.get('errors')||[];
    }


    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  doneSaving: function() {
    this.transitionToRoute('environment', this.get('environment.id'));
  },
});
