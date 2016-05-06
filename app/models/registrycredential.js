import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'registryCredential',
  name: '',
  publicValue: '',
  //secretValue: '', -- This can't be set because the secret isn't sent back on edit
  email: ''
});
