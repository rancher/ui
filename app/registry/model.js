import Cattle from 'ui/utils/cattle';

var Registry = Cattle.TransitioningResource.extend({
  type: 'registry',
  serverAddress: null
});

Registry.reopenClass({
  alwaysInclude: ['credentials'],
});

export default Registry;
