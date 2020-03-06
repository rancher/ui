import Service, { inject as service } from '@ember/service';
import { toTitle } from 'shared/utils/util';
import { get } from '@ember/object';
import { computed } from '@ember/object';

export default Service.extend({
  globalStore:     service(),

  createProfileKey(profile, benchmark) {
    return `${ benchmark.toUpperCase() } ${ profile } `;
  },

  clusterScanConfigToProfile(scanConfig) {
    return this.createProfileKey(scanConfig.cisScanConfig.profile, scanConfig.cisScanConfig.overrideBenchmarkVersion);
  },

  profileToClusterScanConfig(profile) {
    const profileBenchmark = this.cisScanProfiles[profile];

    return {
      cisScanConfig: {
        failuresOnly:             false,
        skip:                     null,
        profile:                  profileBenchmark.profile,
        overrideBenchmarkVersion: profileBenchmark.benchmark
      }
    }
  },

  defaultClusterScanConfig: computed(function() {
    return this.profileToClusterScanConfig(this.defaultCisScanProfileOption);
  }),

  cisScanConfigProfiles: computed(function() {
    return this.globalStore.getById('schema', 'cisscanconfig').optionsFor('profile');
  }),

  cisScanBenchmarks: computed(() => {
    return [
      'rke-cis-1.4',
      'rke-cis-1.5'
    ]
  }),

  cisScanProfiles: computed('cisScanConfigProfiles', 'cisScanBenchmarks', function() {
    const profiles = get(this, 'cisScanConfigProfiles');
    const benchmarks = get(this, 'cisScanBenchmarks');

    const asArray = profiles.flatMap((profile) => {
      return benchmarks.map((benchmark) => ({
        [this.createProfileKey(profile, benchmark)]: {
          benchmark,
          profile
        }
      }))
    });

    return Object.assign.apply({}, asArray);
  }),

  cisScanProfileOptions: computed('cisScanProfiles', function() {
    return Object.keys(get(this, 'cisScanProfiles')).map((key) => ({
      label: toTitle(key),
      value: key
    }))
  }),

  defaultCisScanProfileOption: computed('cisScanProfileOptions', function() {
    return get(this, 'cisScanProfileOptions')[0].value;
  }),
});
