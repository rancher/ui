import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLoadBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditLoadBalancerConfig, {
  editing: true,
  primaryResource: Ember.computed.alias('model.config'),
  queryParams: ['tab'],
  tab: 'listeners',

  initFields: function() {
    this._super();
    this.initListeners();
    this.initStickiness();
    this.initHealthCheck();
  },

  didSave: function() {
    var orig = this.get('listeners')||[];
    var neu = this.get('listenersArray');

    var promises = [];
    orig.forEach((listener) => {
      // Delete removed
      if( neu.indexOf(listener) === -1 )
      {
        promises.push(listener.delete());
      }
    });

    neu.forEach((listener) => {
      if ( orig.indexOf(listener) === -1 )
      {
        promises.push(listener.save());
      }
    });

    return Ember.RSVP.all(promises).then(() => {
      var ids = neu.filter((listener) => {
        return neu.indexOf(listener) >= 0;
      }).map((listener) => {
        return listener.get('id');
      });

      return this.get('config').doAction('setlisteners',{loadBalancerListenerIds: ids});
    });
  },

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
