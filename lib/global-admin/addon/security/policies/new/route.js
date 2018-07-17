import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    var policy = this.get('globalStore').createRecord({
      type:                            'podSecurityPolicyTemplate',
      name:                            '',
      allowPrivilegeEscalation:        false,
      defaultAllowPrivilegeEscalation: false,
      hostIPC:                         false,
      hostNetwork:                     false,
      hostPID:                         false,
      privileged:                      false,
      readOnlyRootFilesystem:          false,
    });

    return { policy, }
  },
});
