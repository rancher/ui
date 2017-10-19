import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  store: Ember.inject.service('store'),
  userStore: Ember.inject.service('user-store'),
  projects: Ember.inject.service(),

  kubernetesDashboard: Ember.computed('projects.current.id','projects.currentCluster.id', function() {
    let url = this.get('app.kubernetesDashboard')
        .replace(this.get('app.projectToken'), this.get('projects.current.id'))
        .replace(this.get('app.clusterToken'), this.get('projects.currentCluster.id'));

    url += '#!/overview';
    return url;
  }),

  getInstanceToConnect() {
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
  },
});
