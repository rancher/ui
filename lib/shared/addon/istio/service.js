import Service from '@ember/service';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { hashSettled, resolve, reject } from 'rsvp';

export default Service.extend({
  globalStore: service(),

  useNewKialiUrl: false,
  _cached:        false,

  checkKialiUiEndpoint(clusterId, force = false) {
    if (this._cached && !force) {
      return resolve({ useNewKialiUrl: this.useNewKialiUrl });
    }

    const { globalStore } = this;

    const preIsitio142BreakingKialiUrl = globalStore.rawRequest({
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/`,
      method: 'GET',
    });
    const postIsitio142BreakingKialiUrl = globalStore.rawRequest({
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/`,
      method: 'GET',
    });

    // project member may not have access to the system project to get the version info
    // so test both links (istio <=1.4.2(rancher catalog version 0.1.2) uses -http:80)
    return hashSettled({
      preIsitio142BreakingKialiUrl,
      postIsitio142BreakingKialiUrl
    }).then((resp) => {
      set(this, '_cached', true);

      if (resp.preIsitio142BreakingKialiUrl.state === 'fulfilled') {
        set(this, 'useNewKialiUrl', false);
      } else if (resp.postIsitio142BreakingKialiUrl.state === 'fulfilled') {
        set(this, 'useNewKialiUrl', true);
      } else {
        set(this, 'useNewKialiUrl', false);
      }

      return resolve({ useNewKialiUrl: this.useNewKialiUrl });
    }).catch(() => {
      set(this, '_cached', false);

      return reject({ useNewKialiUrl: false });
    });
  },
});
