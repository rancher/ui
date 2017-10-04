import Ember from 'ember';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  store: Ember.inject.service('store'),
  userStore: Ember.inject.service('user-store'),
  projects: Ember.inject.service(),

  kubernetesDashboard: function() {
    let kbd = this.get('app.kubernetesDashboard')
        .replace(this.get('app.projectToken'), this.get('projects.current.id'))
        .replace(this.get('app.clusterToken'), this.get('projects.currentCluster.id'));
    return `${kbd}#!/overview?namespace=default`; // im not 100% sure if '#!/overview?namespace=' is the final route, maybe we can do this better, but denise wanted this
  }.property('projects.current.id','projects.currentCluster.id'),

  isReady() {
    let store = this.get('store');
    return store.find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if ( stack )
      {
        return store.rawRequest({
          url: `${this.get('kubernetesEndpoint')}/version`
        }).then(() => {
          console.log('isReady: true');
          return true;
        }).catch(() => {
          console.log('isReady: false');
          return false;
        });
      }

      console.log('isReady: false2');
      return false;
    }).catch(() => {
      console.log('isReady: false3');
      return Ember.RSVP.resolve(false);
    });
  },

  filterSystemStack(stacks) {
    return (stacks||[]).find((stack) => {
      let info = stack.get('externalIdInfo');
      return (info.kind === C.EXTERNAL_ID.KIND_CATALOG || info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG) &&
        info.base === C.EXTERNAL_ID.KIND_INFRA &&
        info.name === C.EXTERNAL_ID.KIND_KUBERNETES;
    });
  },

  parseKubectlError(err) {
    return ApiError.create({
      status: err.status,
      code: err.body.exitCode,
      message: err.body.stdErr.split(/\n/),
    });
  },

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
