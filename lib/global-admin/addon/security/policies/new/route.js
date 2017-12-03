import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    var policy = this.get('authzStore').createRecord({
      type: 'podSecurityPolicyTemplate',
      name: '',
      allowPrivilegeEscalation: false,
      defaultAllowPrivilegeEscalation: false,
      hostIPC: false,
      hostNetwork: false,
      hostPID: false,
      privileged: false,
      readOnlyRootFilesystem: false,
    });
    return this.get('authzStore').find('podSecurityPolicyTemplate', null, { url: 'podSecurityPolicyTemplates', forceReload: true, removeMissing: true }).then((policies) => {
      return {
        policy: policy,
        policies: policies,
      }
    });
  },
});
