import Cattle from '../../utils/cattle';

export default Cattle.TransitioningResource.extend({
  type: 'apiKey',
  kind: 'apiKey',
  publicValue: null,
  secretValue: null,
});
