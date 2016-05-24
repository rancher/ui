import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  isReady() {
    return this.get('store').find('environment').then((stacks) => {
      return this.get('store').find('service').then((services) => {
        let eId = C.EXTERNALID.KIND_SYSTEM + C.EXTERNALID.KIND_SEPARATOR + C.EXTERNALID.KIND_SWARM;
        let stack = stacks.filterBy('externalId', eId)[0];
        if ( stack )
        {
          let matching = services.filterBy('environmentId', stack.get('id'));
          let expect = matching.get('length');
          let healthy = matching.filterBy('healthState', 'healthy').get('length');
          return ( expect > 0 && expect === healthy );
        }

        return false;
      });
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },
});
