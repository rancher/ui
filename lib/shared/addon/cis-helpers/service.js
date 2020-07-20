import Service, { inject as service } from '@ember/service';
import { toTitle } from 'shared/utils/util';
import { get } from '@ember/object';
import { computed } from '@ember/object';
import StatefulPromise from 'shared/utils/stateful-promise';

export default Service.extend({
  globalStore:        service(),
  intl:               service(),
  securityScanConfig: service(),

  createProfileKey(profile, benchmark) {
    return profile && benchmark
      ? `${ benchmark.toUpperCase() } ${ profile } `
      : '';
  },

  clusterScanConfigToProfile(scanConfig) {
    return this.createProfileKey(scanConfig.cisScanConfig.profile, scanConfig.cisScanConfig.overrideBenchmarkVersion);
  },

  profileToClusterScanConfig(profileRaw) {
    const [benchmark, profile] = profileRaw.toLowerCase().split(' ');

    return {
      cisScanConfig: {
        failuresOnly:             false,
        skip:                     null,
        overrideBenchmarkVersion: benchmark,
        profile,
      }
    }
  },

  /**
   * Converts an id that looks like 1.1.9 into 000010000100009. This
   * allows us to appropriately compare the ids as if they are versions
   * instead of just doing a naive string comparison.
   * @param {*} id
   */
  createSortableId(id) {
    const columnWidth = 5;
    const splitId = id.trim().split('.');

    return splitId
      .map((column) => {
        const suffix = column.match(/[a-z]$/i) ? '' : 'a';
        const columnWithSuffix = column + suffix;
        const columnPaddingWidth = Math.max(columnWidth - columnWithSuffix.length, 0)

        return '0'.repeat(columnPaddingWidth) + columnWithSuffix;
      })
      .join('');
  },

  defaultClusterScanConfig: computed(function() {
    return this.profileToClusterScanConfig(this.defaultCisScanProfileOption);
  }),

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

  benchmarkVersions: computed(function() {
    return StatefulPromise.wrap(this.globalStore.findAll('cisBenchmarkVersion'), []);
  }),

  benchmarkLookup: computed('benchmarkVersions.value', 'securityScanConfig.parsedSecurityScanConfig', 'securityScanConfig.parsedSecurityScanConfig.skip', function() {
    const getUserSkip = (benchmark) => {
      try {
        const userSkipLookup = get(this, 'securityScanConfig.parsedSecurityScanConfig.skip');
        const userSkip = userSkipLookup[benchmark];

        const skips = (Array.isArray(userSkip) && userSkip.every((s) => typeof s === 'string'))
          ? userSkip
          : [];

        return skips;
      } catch (ex) {
        return [];
      }
    };

    return get(this, 'benchmarkVersions.value')
      .filter((bv) => bv.info.notApplicableChecks && bv.info.skippedChecks)
      .reduce((agg, bv) => ({
        ...agg,
        [bv.name]: {
          notApplicableChecks: Object.entries(bv.info.notApplicableChecks).map((e) => ({
            sortableId: this.createSortableId(e[0]),
            id:         e[0],
            why:        e[1]
          })).sortBy('sortableId'),
          skippedChecks:       Object.entries(bv.info.skippedChecks).map((e) => ({
            sortableId:  this.createSortableId(e[0]),
            id:          e[0],
            why:         e[1]
          })).sortBy('sortableId'),
          userSkippedChecks: getUserSkip(bv.name)
        }
      }), {});
  }),
});
