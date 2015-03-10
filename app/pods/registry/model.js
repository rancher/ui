import Cattle from 'ui/utils/cattle';

var Registry = Cattle.TransitioningResource.extend({
  type: 'registry',
});

Registry.reopenClass({
  alwaysInclude: ['credentials'],
});

export default Registry;
