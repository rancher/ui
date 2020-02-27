import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { computed } from '@ember/object';

export default Service.extend({
  globalStore: service(),

  allVersions:    null,

  stableVersions: computed('allVersions.[]', function() {
    return ( this.allVersions || []).filterBy('id', 'stable');
  }),

  async getAllVersions() {
    try {
      const resp = await this.globalStore.request({ url: '/v1-release/channel' });
      const versions = [];

      resp.content.forEach((ver) => {
        versions.pushObject(ver.latest);
      });

      return set(this, 'allVersions', versions);
    } catch (err) {
      return set(this, 'allVersions', []);
    }
  },
});
