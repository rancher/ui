import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  model: function(params) {
    let store = this.get('store');
    if (params.kubernetes) {
      let systemProject = this.get('projects.current.cluster.systemProject');
      let inst;

      if ( !systemProject ) {
        return Ember.RSVP.reject('Unable to locate system environment');
      }

      return this.get('userStore').rawRequest({
        url: systemProject.links.instances,
      }).then((res) => {
        inst = res.body.data.find((c) => {
          return c.state === 'running'
            && c.labels
            && c.labels[C.LABEL.K8S_KUBECTL]+'' === 'true';
        });

        if ( inst ) {
          return this.get('store').createRecord(inst);
        } else {
          return Ember.RSVP.reject('Unable to find running kubectl container');
        }
      });
    }

    return store.find('container', params.instanceId).then((response) => {
      return response;
    });
  },
});
