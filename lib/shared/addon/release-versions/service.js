import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default Service.extend({
  globalStore: service(),

  allVersions:    null,

  async getAllVersions(driver) {
    try {
      const path = driver === 'k3s' ? '/v1-k3s-release/release' : '/v1-rke2-release/release';
      const resp = await this.globalStore.request({ url: path });
      const versions = [];

      resp.content.forEach((ver) => {
        versions.pushObject(ver.version);
      });

      return set(this, 'allVersions', versions);
    } catch (err) {
      return set(this, 'allVersions', []);
    }
  },
});
