import Service, { inject as service } from '@ember/service';
import { toTitle } from 'shared/utils/util';
import { get } from '@ember/object';
import { computed } from '@ember/object';
import StatefulPromise from 'shared/utils/stateful-promise';

export default Service.extend({
  globalStore:     service(),

  createProfileKey(profile, benchmark) {
    return profile && benchmark
      ? `${ benchmark.toUpperCase() } ${ profile } `
      : '';
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

  cisScanConfigProfiles: computed(function() {
    return this.globalStore.getById('schema', 'cisscanconfig').optionsFor('profile');
  }),

  cisConfigs: computed(function() {
    return StatefulPromise.wrap(this.globalStore.findAll('cisConfig'), []);
  }),

  benchmarkMapping: computed('cisConfigs.value', function() {
    const configs = get(this, 'cisConfigs.value');

    return configs.reduce((agg, config) => ({
      ...agg,
      [config.name]: config.params.benchmarkVersion
    }), {})
  }),

  benchmarkMappingValues: computed('benchmarkMapping', function() {
    return Object.values(get(this, 'benchmarkMapping'));
  }),

  cisScanBenchmarks: computed.uniq('benchmarkMappingValues'),

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

    return asArray.length > 0 ? Object.assign.apply({}, asArray) : {};
  }),

  getDefaultCisScanProfileOption(kubernetesVersion) {
    const mapping = get(this, 'benchmarkMapping');
    const version = kubernetesVersion.split('.').slice(0, 2).join('.');

    const defaultBenchmark = mapping[version] ? mapping[version] : mapping['default'];
    const defaultProfile = get(this, 'cisScanConfigProfiles')[0];

    return this.createProfileKey(defaultProfile, defaultBenchmark);
  },

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
