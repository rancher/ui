import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, {
  queryParams: ['tab'],
  tab: 'listeners',
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.config'),

  initFields: function() {
    this._super();
    this.set('listenersArray', [
      this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'tcp',
        targetPort: '',
        targetProtocol: 'tcp',
        algorithm: 'roundrobin',
      })
    ]);
  },

  didSave: function() {
    var listeners = this.get('listenersArray');
    var promises = [];
    listeners.forEach((listener) => {
      promises.push(listener.save());
    });

    return Ember.RSVP.all(promises).then((listeners) => {
      var ids = listeners.map((listener) => {
        return listener.get('id');
      });

      return this.get('config').doAction('setlisteners',{loadBalancerListenerIds: ids});
    });
  },

  doneSaving: function() {
    this.transitionToRoute('loadbalancerconfigs');
  },
});
