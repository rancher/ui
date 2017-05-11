import C from 'ui/utils/constants';

export function initialize(instance) {
  var access    = instance.lookup('service:access');
  var userStore = instance.lookup('service:user-store');
  var session   = instance.lookup('service:session');
  var idnt      = session.get(C.SESSION.IDENTITY) || {};

  idnt.type     = 'identity';

  access.set('identity', userStore.createRecord(idnt));
}

export default {
  name: 'identity',
  after: ['user-store'],
  initialize: initialize
};
