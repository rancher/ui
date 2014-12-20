import Cattle from 'ui/utils/cattle';

var Volume = Cattle.TransitioningResource.extend({
  type: 'volume'
});

Volume.reopenClass({
  alwaysInclude: ['mounts']
});

export default Volume;
