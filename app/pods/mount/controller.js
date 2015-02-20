import Cattle from 'ui/utils/cattle';
import Ember from 'ember';

var MountController = Cattle.TransitioningResourceController.extend({
  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),
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
