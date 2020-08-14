import Service, { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';

const CONFIG_MAP_FILE_KEY = 'config.json'
const CONFIG_MAP_NAMESPACE_ID = 'security-scan';
const CONFIG_MAP_NAME = 'security-scan-cfg';
const CONFIG_MAP_ID = `${ CONFIG_MAP_NAMESPACE_ID }:${ CONFIG_MAP_NAME }`;

export default Service.extend({
  scope:        service(),
  growl:        service(),
  intl:         service(),
  projectStore: service('store'),
  app:          service(),

  FILE_KEY: CONFIG_MAP_FILE_KEY,

  report:         null,
  configMaps:     [],

  setReport(report) {
    set(this, 'report', report);
  },

  async loadAsyncConfigMap(cluster) {
    set(this, 'cluster', cluster);

    const systemProject = get(cluster, 'systemProject');
    const configMapsAsync = systemProject && systemProject.hasLink('configMaps') && get(cluster, 'state') === 'active' ? systemProject.followLink('configMaps') : []
    const configMaps = await configMapsAsync;

    set(this, 'configMaps', [...configMaps.content]);

    return configMaps;
  },

  defaultValue: computed('report.version', function() {
    return { skip: { [get(this, 'report.version')]: [] } };
  }),

  defaultData: computed('defaultValue', function() {
    return { [CONFIG_MAP_FILE_KEY]: JSON.stringify(get(this, 'defaultValue')) };
  }),

  securityScanConfig: computed('configMaps', 'configMaps.[]', 'configMaps.@each', function() {
    return get(this, 'configMaps').findBy('id', 'security-scan:security-scan-cfg');
  }),

  parsedSecurityScanConfig: computed('securityScanConfig.data.[]', 'securityScanConfig.data.@each', 'loadedTrigger', function() {
    try {
      return JSON.parse(get(this, 'securityScanConfig.data')[CONFIG_MAP_FILE_KEY]);
    } catch (error) {
      return get(this, 'defaultValue');
    }
  }),

  validateSecurityScanConfig() {
    try {
      const data = get(this, `securityScanConfig.data`);

      if (!data) {
        return;
      }

      const configFile = data[CONFIG_MAP_FILE_KEY];

      if (!configFile) {
        return;
      }

      const parsed = JSON.parse(configFile);
      const version = get(this, 'report.version');

      if (!version) {
        return;
      }

      if (parsed.skip[version] && !Array.isArray(parsed.skip[version])) {
        throw new Error("Security Scan Config didin't contain the 'skip' array.");
      }
    } catch (error) {
      this.growl.fromError(this.intl.t('cis.scan.detail.error.parseConfig'), error.message);
      throw error;
    }
  },

  skipList: computed('securityScanConfig.data.@each', function() {
    const defaultValue = [];

    try {
      const securityScanConfig = get(this, 'securityScanConfig');

      if (!securityScanConfig) {
        return [];
      }

      const version = get(this, 'report.version');
      const skip = get(this, `parsedSecurityScanConfig.skip`)[version];

      return Array.isArray(skip) ? skip : defaultValue;
    } catch {
      return defaultValue;
    }
  }),

  async editSecurityScanConfig(newValue) {
    const securityScanConfig = await Promise.resolve(get(this, 'securityScanConfig') || this.createAndSaveDefaultConfigMap());

    set(securityScanConfig, 'data', newValue);
    securityScanConfig.save();
  },

  async createAndSaveDefaultConfigMap() {
    try {
      const configMaps = get(this, 'configMaps');
      const systemProjectLink = get(this, 'scope.currentCluster.systemProject.links.self');
      const creationUrl =  `${ systemProjectLink }/configmap`;
      const recordLink =  `${ systemProjectLink }/configMaps/${ CONFIG_MAP_ID }`;
      const configRecord = get(this, 'projectStore').createRecord({
        type:        'configMap',
        id:          CONFIG_MAP_ID,
        namespaceId: CONFIG_MAP_NAMESPACE_ID,
        name:        CONFIG_MAP_NAME,
        data:        get(this, 'defaultData'),
        links:       {}
      });

      configMaps.pushObject(configRecord);
      await configRecord.save({
        url:    creationUrl,
        method: 'POST'
      });

      // We have to set this link after .save instead of before because .save will attempt to
      // use the self link to save the record and saving the record isn't setting the self link.
      set(configRecord, 'links.self', recordLink);

      return configRecord;
    } catch (error) {
      this.growl.fromError(this.intl.t('cis.scan.detail.error.createDefault'), error.message);
    }
  },

  editSkipList(newValue) {
    const version = get(this, 'report.version');

    const existingSkip = get(this, 'parsedSecurityScanConfig.skip') || {};
    const newSkipListObject = {
      skip: {
        ...existingSkip,
        [version]: newValue
      }
    };
    const newConfig = { [get(this, 'FILE_KEY')]: JSON.stringify(newSkipListObject) };

    this.editSecurityScanConfig(newConfig);
  }
});
