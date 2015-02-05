import Cattle from 'ui/utils/cattle';
import Ember from 'ember';

var MountController = Cattle.TransitioningResourceController.extend({
  icon: 'fa-database',

  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),
});

MountController.reopenClass({
  stateMap: {
   'active':  {icon: 'fa-circle-o', color: 'text-sucess'},
   'inactive': {icon: 'fa-circle',  color: 'text-danger'},
   'removed': {icon: 'fa-trash',    color: 'text-danger'},
   'purged':  {icon: 'fa-fire',     color: 'text-danger'}
  },
});

export default MountController;
