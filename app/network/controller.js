import Cattle from 'ui/utils/cattle';

var NetworkController = Cattle.LegacyTransitioningResourceController.extend();

NetworkController.reopenClass({
  stateMap: {
    'active':     {icon: 'ss-headphones', color: 'text-success'},
  }
});

export default NetworkController;
