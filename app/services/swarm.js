import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  isReady() {
    return this.get('store').find('stack').then((stacks) => {
      return this.get('store').find('service').then((services) => {
        let stack = this.filterSystemStack(stacks);
        if ( stack )
        {
          let matching = services.filterBy('stackId', stack.get('id'));
          let expect = matching.get('length');
          let healthy = Util.filterByValues(matching, 'healthState', C.READY_STATES).get('length');
          return ( expect > 0 && expect === healthy );
        }

        return false;
      });
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  filterSystemStack(stacks) {
    const OLD_STACK_ID = C.EXTERNAL_ID.KIND_SYSTEM + C.EXTERNAL_ID.KIND_SEPARATOR + C.EXTERNAL_ID.KIND_SWARM;
    const NEW_STACK_PREFIX = C.EXTERNAL_ID.KIND_SYSTEM_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + C.CATALOG.LIBRARY_KEY + C.EXTERNAL_ID.GROUP_SEPARATOR + C.EXTERNAL_ID.KIND_SWARM + C.EXTERNAL_ID.GROUP_SEPARATOR;

    var stack = (stacks||[]).filter((stack) => {
      let externalId = stack.get('externalId')||'';
      return externalId === OLD_STACK_ID || externalId.indexOf(NEW_STACK_PREFIX) === 0;
    })[0];

    return stack;
  },
});
