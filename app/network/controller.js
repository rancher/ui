import Cattle from 'ui/utils/cattle';

var NetworkController = Cattle.LegacyTransitioningResourceController.extend();

NetworkController.reopenClass({
  stateMap: {
    'active':     {icon: 'ss-headphones', color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-danger'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default NetworkController;
