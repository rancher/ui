import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  isReady() {
    var id = C.EXTERNALID.KIND_SYSTEM + C.EXTERNALID.KIND_SEPARATOR + C.EXTERNALID.KIND_SWARM;
    return this.get('store').find('environment', null, {filter: {externalId: id}, include: ['services'], forceReload: true}).then((envs) => {
      var ready = false;
      envs.forEach((env) => {
        var services = env.get('services');
        var num = services.get('length');
        var active = services.filterBy('state','active').get('length');
        if ( env.get('state') === 'active' && num && num === active )
        {
          ready = true;
        }
      });

      return ready;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },
});
