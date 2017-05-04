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

  supportsAuth: function() {
    let v = this.get('version');
    if ( v && v['major'] )
    {
      let major = parseInt(v['major'],10);
      let minor = parseInt(v['minor'],10);
      return (major > 1) || (major === 1 && minor >= 6);
    }
  }.property('version.{minor,major}'),

  isReady() {
    let store = this.get('store');
    return store.find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if ( stack )
      {
        return store.rawRequest({
          url: `${this.get('kubernetesEndpoint')}/version`
        }).then((res) => {
          this.set('version', res.body);
          return true;
        }).catch(() => {
          return false;
        });
      }

      return false;
    }).catch(() => {
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
