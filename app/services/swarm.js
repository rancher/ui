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
    return (stacks||[]).find((stack) => {
      let info = stack.get('externalIdInfo');
      return (info.kind === C.EXTERNAL_ID.KIND_CATALOG || info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG) &&
        info.base === C.EXTERNAL_ID.KIND_INFRA &&
        info.name === C.EXTERNAL_ID.KIND_SWARM;
    });
  },
});
