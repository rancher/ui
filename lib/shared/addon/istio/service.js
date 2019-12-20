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

    const preBreakKialiUrl = globalStore.rawRequest({
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/`,
      method: 'GET',
    });
    const postBreakKialiUrl = globalStore.rawRequest({
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/`,
      method: 'GET',
    });

    // project member may not have access to the system project to get the version info
    // so test both links (istio <=0.1.2 uses -http:80)
    return hashSettled({
      preBreakKialiUrl,
      postBreakKialiUrl
    }).then((resp) => {
      set(this, '_cached', true);

      if (resp.preBreakKialiUrl.state === 'fulfilled') {
        set(this, 'useNewKialiUrl', false);
      } else if (resp.postBreakKialiUrl.state === 'fulfilled') {
        set(this, 'useNewKialiUrl', true);
      } else {
        set(this, 'useNewKialiUrl', false);
      }

      return resolve({ useNewKialiUrl: this.useNewKialiUrl });
    }).catch(() => {
      return reject({ useNewKialiUrl: false });
    });
  },
});
