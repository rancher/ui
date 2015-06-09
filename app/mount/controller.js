import Cattle from 'ui/utils/cattle';
import Ember from 'ember';

var MountController = Cattle.TransitioningResourceController.extend({
  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),

  instance: function() {
    var proxy = Ember.ObjectProxy.create({content: {}});
    this.get('store').find('container', this.get('instanceId')).then((container) => {
      proxy.set('content', container);
    });

    return proxy;
  }.property('instanceId'),
});

MountController.reopenClass({
  stateMap: {
   'active':    {icon: 'ss-record',   color: 'text-success'},
   'inactive':  {icon: 'fa fa-circle',color: 'text-danger'},
   'removed':   {icon: 'ss-trash',    color: 'text-danger'},
   'purged':    {icon: 'ss-tornado',  color: 'text-danger'}
  },
});

export default MountController;
