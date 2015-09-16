import Cattle from 'ui/utils/cattle';

var NetworkController = Cattle.LegacyTransitioningResourceController.extend();

NetworkController.reopenClass({
  stateMap: {
    'active':     {icon: 'icon icon-network', color: 'text-success'},
  }
});

export default NetworkController;
