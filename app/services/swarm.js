import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  isReady() {
    return this.get('store').find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if ( stack )
      {
        return true;
      }

      return false;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  filterSystemStack(stacks) {
    const OLD_STACK_ID = C.EXTERNAL_ID.KIND_SYSTEM + C.EXTERNAL_ID.KIND_SEPARATOR + C.EXTERNAL_ID.KIND_SWARM;
    const NEW_STACK_PREFIX = C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + C.CATALOG.LIBRARY_KEY + C.EXTERNAL_ID.GROUP_SEPARATOR + C.EXTERNAL_ID.KIND_SWARM + C.EXTERNAL_ID.GROUP_SEPARATOR;

    var stack = (stacks||[]).filter((stack) => {
      let externalId = stack.get('externalId')||'';
      return externalId === OLD_STACK_ID || externalId.indexOf(NEW_STACK_PREFIX) >= 0;
    })[0];

    return stack;
  },
});
