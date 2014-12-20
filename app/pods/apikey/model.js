import Cattle from 'ui/utils/cattle';

export default Cattle.TransitioningResource.extend({
  type: 'apiKey',
  kind: 'apiKey',
  publicValue: null,
  secretValue: null,
});
