import Ember from 'ember';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  store: Ember.inject.service('store'),
  projects: Ember.inject.service(),

  kubernetesEndpoint: function() {
    return this.get('app.kubernetesEndpoint')
      .replace(this.get('app.projectToken'), this.get('projects.current.id'))
      .replace(this.get('app.clusterToken'), this.get('projects.currentCluster.id'));
  }.property('projects.current.id','projects.currentCluster.id'),

  kubectlEndpoint: function() {
  }.property(),

  kubernetesDashboard: function() {
    return this.get('app.kubernetesDashboard')
      .replace(this.get('app.projectToken'), this.get('projects.current.id'))
      .replace(this.get('app.clusterToken'), this.get('projects.currentCluster.id'));
  }.property(),

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
});
