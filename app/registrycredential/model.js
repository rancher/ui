import Cattle from 'ui/utils/cattle';

export default Cattle.TransitioningResource.extend({
  type: 'registryCredential',
  name: '',
  publicValue: '',
  //secretValue: '', -- This can't be se because the secret isn't sent back on edit
  email: ''
});
