import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service(),
  store: Ember.inject.service(),
  pipelineStore: Ember.inject.service('pipeline-store'),
  selectedGitUser: null,
  pipelinesEndpoint: function() {
    return this.get('app.pipelinesEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`, 'app.pipelinesEndpoint'),
  pipelinesUIPoint: function() {
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    return `r/projects/${projectId}/pipeline-ui:8000/`;
  }.property(`tab-session.${C.TABSESSION.PROJECT}`),
  showWarning: true,
  ready: null,
  isReady() {
    let store = this.get('store');
    var pipelineStore = this.get('pipelineStore');
    var result = { has: false, ready: false, hasActivityApprove: false };
    this.set('pipelineStore.baseUrl', this.get('pipelinesEndpoint'));
    return store.find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if (stack) {
        return store.rawRequest({
          url: `${this.get('pipelinesEndpoint')}`
        }).then(() => {
          // console.log('isReady: true');
          this.set('ready', { has: true, ready: true });
          // return {has: true, ready: true};
          return pipelineStore.find('activity').then((activity) => {
            result = { has: true, ready: true, hasActivityApprove: false };
            var hasActivityApprove = activity
                                      .find(ele => {
                                        if (ele.status === 'Pending') {
                                          return true;
                                        }
                                        return false;
                                      });
            if(hasActivityApprove) { result.hasActivityApprove = true; }
            this.set('ready', result);
            return result;
          }).catch(() => {
            result = { has: true, ready: true, hasActivityApprove: false };
            this.set('ready', result);
            return result;
          });
        }).catch(() => {
          // console.log('isReady: false');
          this.set('ready', { has: true, ready: false });
          return { has: true, ready: false };
        });
      }
      this.set('ready', { has: false, ready: false });
      // console.log('isReady: false2');
      return { has: false, ready: false };
    }).catch(() => {
      // console.log('isReady: false3');
      this.set('ready', { has: false, ready: false });
      return Ember.RSVP.resolve({ has: false, ready: false });
    });
  },
  filterSystemStack(stacks) {
    return (stacks || []).find((stack) => {
      let info = stack.get('externalIdInfo');
      return (info.kind === C.EXTERNAL_ID.KIND_CATALOG || info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG) &&
        info.base === C.EXTERNAL_ID.KIND_INFRA &&
        info.name === 'CICD';
    });
  }
});
