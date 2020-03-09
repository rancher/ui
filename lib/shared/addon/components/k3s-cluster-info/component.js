import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import Semver from 'semver';
import { sortVersions } from 'shared/utils/sort';

export default Component.extend({
  k3s: service(),

  layout,

  editing:     false,
  k3sConfig:   alias('cluster.k3sConfig'),
  allVersions: computed('k3s.allVersions.[]', function() {
    const currentVersion = get(this, 'k3sConfig.kubernetesVersion');
    const versionsMapped = [];
    let allVersions    = this.k3s.allVersions || [];

    if (!allVersions.includes(currentVersion)) {
      allVersions.unshift(currentVersion);
    }

    allVersions = [...sortVersions(allVersions).reverse()];

    allVersions.forEach((v) => {
      if (Semver.gte(v, currentVersion)) {
        versionsMapped.pushObject({
          value: v,
          label: v,
        });
      }
    });

    return versionsMapped;
  }),
});
