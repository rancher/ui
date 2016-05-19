import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  isReady() {
    return this.get('store').find('environment').then((stacks) => {
      let eId = C.EXTERNALID.KIND_SYSTEM + C.EXTERNALID.KIND_SEPARATOR + C.EXTERNALID.KIND_SWARM;
      let matching = stacks.filterBy('externalId', eId);
      let expect = matching.get('length');
      let healthy = matching.filterBy('healthState', 'healthy').get('length');
      return ( expect > 0 && expect === healthy );
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },
});
