import Cattle from '../utils/cattle';

var NetworkController = Cattle.TransitioningResourceController.extend();

NetworkController.reopenClass({
  stateMap: {
    'active':     {icon: 'fa-code-fork',  color: 'text-success'},
    'inactive':   {icon: 'fa-pause',      color: 'text-muted'},
    'purged':     {icon: 'fa-fire',       color: 'text-danger'},
    'removed':    {icon: 'fa-fire',       color: 'text-danger'},
    'requested':  {icon: 'fa-ticket',     color: 'text-info'},
  }
});

export default NetworkController;
