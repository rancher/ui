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
    return (stacks||[]).find((stack) => {
      let info = stack.get('externalIdInfo');
      return (info.kind === C.EXTERNAL_ID.KIND_CATALOG || info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG) &&
        info.base === C.EXTERNAL_ID.KIND_INFRA;
    });
  },
});
