import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service('tab-session'),
  store: Ember.inject.service(),

  publicUrl: function() {
    return this.get('store').find('service').then((services) => {
      let master = services.filterBy('name', C.MESOS.MASTER_SERVICE)[0];
      if ( master )
      {
        let ips = master.get('endpointsMap')[C.MESOS.MASTER_PORT];
        if ( ips && ips.length ) {
          return 'http://' + ips[0] + ':' + C.MESOS.MASTER_PORT;
        }
      }

      return Ember.RSVP.reject('No mesos-master endpoint found');
    });
  },

  masterUrl: function() {
    let projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    return this.get('app.mesosEndpoint').replace('%PROJECTID%', projectId);
  }.property('app.mesosEndpoint',`tab-session.${C.TABSESSION.PROJECT}`),

  isReady: function() {
    return this.get('store').find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if ( stack )
      {
        return this.get('store').rawRequest({
          url: `${this.get('masterUrl')}/${C.MESOS.HEALTH}`
        }).then(() => {
          return true;
        }).catch(() => {
          return Ember.RSVP.resolve(false);
        });
      }

      return false;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  filterSystemStack(stacks) {
    const OLD_STACK_ID = C.EXTERNAL_ID.KIND_SYSTEM + C.EXTERNAL_ID.KIND_SEPARATOR + C.EXTERNAL_ID.KIND_MESOS;
    const NEW_STACK_PREFIX = C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + C.CATALOG.LIBRARY_KEY + C.EXTERNAL_ID.GROUP_SEPARATOR + C.EXTERNAL_ID.KIND_MESOS + C.EXTERNAL_ID.GROUP_SEPARATOR;

    var stack = (stacks||[]).filter((stack) => {
      let externalId = stack.get('externalId')||'';
      return externalId === OLD_STACK_ID || externalId.indexOf(NEW_STACK_PREFIX) >= 0;
    })[0];

    return stack;
  },
});
