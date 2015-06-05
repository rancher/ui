import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditTargetIp from 'ui/mixins/edit-targetip';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditTargetIp, {
  queryParams: ['environmentId','serviceId'],
  environmentId: null,
  serviceId: null,
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.service'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('service.externalIpAddresses.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
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
