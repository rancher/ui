import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default Service.extend({
  globalStore: service(),

  allVersions:    null,

  async getAllVersions() {
    try {
      const resp = await this.globalStore.request({ url: '/v1-release/release' });
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
