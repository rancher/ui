import Cattle from 'ui/utils/cattle';

var NetworkController = Cattle.TransitioningResourceController.extend();

NetworkController.reopenClass({
  stateMap: {
    'active':     {icon: 'ss-headphones', color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-muted'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default NetworkController;
