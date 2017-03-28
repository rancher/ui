import Ember from 'ember';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service(),
  store: Ember.inject.service('store'),

  kubernetesEndpoint: function() {
    return this.get('app.kubernetesEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubernetesEndpoint'),

  kubectlEndpoint: function() {
    return this.get('app.kubectlEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubectlEndpoint'),

  kubernetesDashboard: function() {
    return this.get('app.kubernetesDashboard').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubernetesDashboard'),

  workload() {
    let url = this.get('app.kubernetesWorkload').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
    return this.get('store').rawRequest({
      url: url
    }).then(function(res) {
      return res.body;
    });
  },

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
