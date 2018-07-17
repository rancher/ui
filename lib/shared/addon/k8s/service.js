import { reject } from 'rsvp';
import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Service.extend({
  store:       service('store'),
  globalStore: service(),
  scope:       service(),
  app:         service(),

  kubernetesDashboard: computed('scope.currentProject.id', 'scope.currentCluster.id', function() {
    let url = this.get('app.kubernetesDashboard')
      .replace(this.get('app.projectToken'), this.get('scope.currentProject.id'))
      .replace(this.get('app.clusterToken'), this.get('scope.currentCluster.id'));

    url += '#!/overview';

    return url;
  }),

  getInstanceToConnect() {
    let systemProject = this.get('scope.currentProject.cluster.systemProject');
    let inst;

    if ( !systemProject ) {
      return reject('Unable to locate system environment');
    }

    return this.get('globalStore').rawRequest({ url: systemProject.links.instances, }).then((res) => {
      inst = res.body.data.find((c) => {
        return c.state === 'running'
          && c.labels
          && `${ c.labels[C.LABEL.K8S_KUBECTL] }` === 'true';
      });

      if ( inst ) {
        return this.get('store').createRecord(inst);
      } else {
        return reject('Unable to find running kubectl container');
      }
    });
  },
});
