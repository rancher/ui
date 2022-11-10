import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reject } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { addQueryParams } from 'ui/utils/util';

export default Service.extend({
  globalStore:        service(),
  maintenanceWindows: [
    {
      value: '',
      label: 'Any Time',
    },
    {
      value: '00:00',
      label: '12:00AM',
    },
    {
      value: '03:00',
      label: '3:00AM',
    },
    {
      value: '06:00',
      label: '6:00AM',
    },
    {
      value: '09:00',
      label: '9:00AM',
    },
    {
      value: '12:00',
      label: '12:00PM',
    },
    {
      value: '15:00',
      label: '3:00PM',
    },
    {
      value: '19:00',
      label: '7:00PM',
    },
    {
      value: '21:00',
      label: '9:00PM',
    },
  ],
  imageTypes: [
    {
      label: 'clusterNew.googlegke.imageType.UBUNTU',
      value: 'UBUNTU',
    },
    {
      label: 'clusterNew.googlegke.imageType.COS',
      value: 'COS'
    },
  ],
  imageTypesV2: [
    {
      label: 'clusterNew.googlegke.imageTypeV2.UBUNTU',
      value: 'UBUNTU',
    },
    {
      label: 'clusterNew.googlegke.imageTypeV2.UBUNTU_D',
      value: 'UBUNTU_CONTAINERD',
    },
    {
      label: 'clusterNew.googlegke.imageTypeV2.COS',
      value: 'COS',
    },
    {
      label: 'clusterNew.googlegke.imageTypeV2.COS_D',
      value: 'COS_CONTAINERD',
    },
    {
      label: 'clusterNew.googlegke.imageTypeV2.WINDOWS_LTSC',
      value: 'WINDOWS_LTSC',
    },
    {
      label: 'clusterNew.googlegke.imageTypeV2.WINDOWS_SAC',
      value: 'WINDOWS_SAC',
    },
  ],
  diskTypes: [
    {
      label: 'clusterNew.googlegke.diskType.pd-standard',
      value: 'pd-standard',
    },
    {
      label: 'clusterNew.googlegke.diskType.pd-ssd',
      value: 'pd-ssd',
    }
  ],
  regions: [
    'asia-east1',
    'asia-east2',
    'asia-northeast1',
    'asia-northeast2',
    'asia-south1',
    'asia-southeast1',
    'asia-southeast2',
    'australia-southeast1',
    'europe-north1',
    'europe-west1',
    'europe-west2',
    'europe-west3',
    'europe-west4',
    'europe-west6',
    'northamerica-northeast1',
    'southamerica-east1',
    'us-central1',
    'us-east1',
    'us-east4',
    'us-west1',
    'us-west2',
    'us-west4'
  ],
  defaultAuthScopes: [
    'devstorage.read_only',
    'logging.write',
    'monitoring',
    'servicecontrol',
    'service.management.readonly',
    'trace.append'
  ],
  defaultZoneType:    'zonal',
  defaultRegionType:  'regional',
  defaultScopeConfig: {
    userInfo:                 'none',
    computeEngine:            'none',
    storage:                  'devstorage.read_only',
    taskQueue:                'none',
    bigQuery:                 'none',
    cloudSQL:                 'none',
    cloudDatastore:           'none',
    stackdriverLoggingAPI:    'logging.write',
    stackdriverMonitoringAPI: 'monitoring',
    cloudPlatform:            'none',
    bigtableData:             'none',
    bigtableAdmin:            'none',
    cloudPub:                 'none',
    serviceControl:           'none',
    serviceManagement:        'service.management.readonly',
    stackdriverTrace:         'trace.append',
    cloudSourceRepositories:  'none',
    cloudDebugger:            'none'
  },
  oauthScopeOptions: {
    DEFAULT: 'default',
    FULL:    'full',
    CUSTOM:  'custom'
  },
  googleAuthURLPrefix:   'https://www.googleapis.com/auth/',
  googleFullAuthUrl:     'https://www.googleapis.com/auth/cloud-platform',

  googleAuthDefaultURLs() {
    return this.defaultAuthScopes.map((a) => `${ this.googleAuthURLPrefix }${ a }`);
  },

  getValueFromOauthScopes(oauthScopes, key, defaultValue) {
    const filteredValues = oauthScopes
      .filter((scope) => scope.indexOf(key) !== -1)
      .map((scope) => {
        return scope
          .replace(this.googleAuthURLPrefix, '')
          .replace(key, '').split('.')
      })
      .filter((splitScopes) => splitScopes.length <= 2);

    if (filteredValues.length !== 1) {
      return defaultValue || 'none';
    }

    return filteredValues[0].length === 1
      ? key
      : `${ key }.${ filteredValues[0][1] }`;
  },

  /**
 * This oauthScopesMapper is responsible for both the mapping to oauthScopes
 * and unmapping from oauthscopes to form values. If you modify either
 * method ensure that the other reflects your changes.
 */
  mapOauthScopes(oauthScopesSelection, scopeConfig) {
    if (oauthScopesSelection === this.oauthScopeOptions.DEFAULT) {
      return this.googleAuthDefaultURLs();
    } else if (oauthScopesSelection === this.oauthScopeOptions.FULL) {
      return [this.googleFullAuthUrl];
    } else if (oauthScopesSelection === this.oauthScopeOptions.CUSTOM) {
      scopeConfig = scopeConfig || {};
      let arr = [];

      Object.keys(scopeConfig).map((key) => {
        if (scopeConfig[key] !== 'none') {
          arr.pushObject(`https://www.googleapis.com/auth/${ scopeConfig[key] }`)
        }
      })

      return arr;
    }
  },
  unmapOauthScopes(oauthScopes) {
    const { getValueFromOauthScopes } = this;
    const containsUrls = oauthScopes && oauthScopes.length > 0;

    if (!containsUrls) {
      return { oauthScopesSelection: this.oauthScopeOptions.DEFAULT };
    }

    const isAllAndOnlyDefaultUrls = ( this.googleAuthDefaultURLs().length === oauthScopes.length
      && this.googleAuthDefaultURLs().every((url) => oauthScopes.indexOf(url) !== -1) );

    if (isAllAndOnlyDefaultUrls) {
      return { oauthScopesSelection: this.oauthScopeOptions.DEFAULT }
    }

    const isOnlyTheFullUrl = oauthScopes.length === 1
      && oauthScopes[0] === this.googleFullAuthUrl;

    if (isOnlyTheFullUrl) {
      return { oauthScopesSelection: this.oauthScopeOptions.FULL }
    }

    return {
      oauthScopesSelection: this.oauthScopeOptions.CUSTOM,
      scopeConfig:          {
        userInfo:                 getValueFromOauthScopes(oauthScopes, 'userinfo', 'none'),
        computeEngine:            getValueFromOauthScopes(oauthScopes, 'compute', 'none'),
        storage:                  getValueFromOauthScopes(oauthScopes, 'devstorage', 'devstorage.read_only'),
        taskQueue:                getValueFromOauthScopes(oauthScopes, 'taskqueue', 'none'),
        bigQuery:                 getValueFromOauthScopes(oauthScopes, 'bigquery', 'none'),
        cloudSQL:                 getValueFromOauthScopes(oauthScopes, 'sqlservice', 'none'),
        cloudDatastore:           getValueFromOauthScopes(oauthScopes, 'clouddatastore', 'none'),
        stackdriverLoggingAPI:    getValueFromOauthScopes(oauthScopes, 'logging', 'logging.write'),
        stackdriverMonitoringAPI: getValueFromOauthScopes(oauthScopes, 'monitoring', 'monitoring'),
        cloudPlatform:            getValueFromOauthScopes(oauthScopes, 'cloud-platform', 'none'),
        bigtableData:             getValueFromOauthScopes(oauthScopes, 'bigtable.data', 'none'),
        bigtableAdmin:            getValueFromOauthScopes(oauthScopes, 'bigtable.admin', 'none'),
        cloudPub:                 getValueFromOauthScopes(oauthScopes, 'pubsub', 'none'),
        serviceControl:           getValueFromOauthScopes(oauthScopes, 'servicecontrol', 'none'),
        serviceManagement:        getValueFromOauthScopes(oauthScopes, 'service.management', 'service.management.readonly'),
        stackdriverTrace:         getValueFromOauthScopes(oauthScopes, 'trace', 'trace.append'),
        cloudSourceRepositories:  getValueFromOauthScopes(oauthScopes, 'source', 'none'),
        cloudDebugger:            getValueFromOauthScopes(oauthScopes, 'cloud_debugger', 'none'),
      }
    };
  },

  parseProjectId(config) {
    const str = get(config, 'credential');

    if ( str ) {
      try {
        const obj = JSON.parse(str);
        // Note: this is a Google project id, not ours.
        const projectId = obj.project_id;

        return projectId;
      } catch (e) {
      }
    }
  },

  request(url, method, data) {
    return this.globalStore.rawRequest({
      url,
      method,
      data
    });
  },

  parseRequestData(url, config, clusterId) {
    const {
      googleCredentialSecret,
      projectID: projectId,
      region,
      zone,
    } = config;
    const data = {};

    if (!isEmpty(googleCredentialSecret)) {
      set(data, 'cloudCredentialId', googleCredentialSecret);

      if (!isEmpty(region)) {
        set(data, 'region', region);
      } else if (!isEmpty(zone)) {
        set(data, 'zone', zone);
      }

      if (!isEmpty(projectId)) {
        set(data, 'projectId', projectId);
      }

      if (!isEmpty(clusterId)) {
        set(data, 'clusterID', clusterId);
      }
    }

    return addQueryParams(url, data);
  },

  async fetchClusters(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');

    let neuURL = this.parseRequestData('/meta/gkeClusters', config, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.clusters.filter((cluster) => cluster?.status === 'RUNNING' || cluster?.status === 'UP');

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchZones(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');

    const neuURL = this.parseRequestData('/meta/gkeZones', config, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.items;
      const locations = get(config, 'locations') || []

      if (locations.length > 0) {
        out.map((o) => {
          if (locations.includes(o.name)) {
            set(o, 'checked', true)
          }
        })
      }

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchVersions(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');

    const neuConfig = { ...config };

    if (config.region && neuConfig.zone) {
      delete neuConfig.zone;
    }

    const neuURL = this.parseRequestData('/meta/gkeVersions', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body;

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchMachineTypes(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');

    const zone = get(config, 'zone') || `${ get(config, 'region') }-b`;
    const neuConfig = { ...config };

    delete neuConfig.region;

    set(neuConfig, 'zone', zone);

    const neuURL = this.parseRequestData('/meta/gkeMachineTypes', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.items;

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchNetworks(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');

    const zone = get(config, 'zone') || `${ get(config, 'region') }-b`;
    const neuConfig = { ...config };

    delete neuConfig.region;

    set(neuConfig, 'zone', zone);

    const neuURL = this.parseRequestData('/meta/gkeNetworks', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.items || [];

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchSubnetworks(cluster, locationType, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');
    const region = locationType === this.defaultZoneType ? `${ config.zone.split('-')[0] }-${ config.zone.split('-')[1] }` : config.region;
    const neuConfig = { ...config };

    delete neuConfig.zone;

    set(neuConfig, 'region', region);

    const neuURL = this.parseRequestData('/meta/gkeSubnetworks', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.items || [];

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchSharedSubnets(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');
    const neuConfig = { ...config };

    delete neuConfig?.zone;
    delete neuConfig?.region;

    const neuURL = this.parseRequestData('/meta/gkeSharedSubnets', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr?.body?.subnetworks || [];

      // const out = [
      //   {
      //     'ipCidrRange':       '10.1.0.0/24',
      //     'network':           'projects/vpc-host-309518/global/networks/vpc-host-network',
      //     'secondaryIpRanges': [
      //       {
      //         'ipCidrRange': '10.2.0.0/21',
      //         'rangeName':   'pods',
      //         'status':      'UNUSED'
      //       },
      //       {
      //         'ipCidrRange': '10.3.0.0/21',
      //         'rangeName':   'services',
      //         'status':      'UNUSED'
      //       }
      //     ],
      //     'subnetwork': 'projects/vpc-host-309518/regions/us-west1/subnetworks/vpc-host-subnet'
      //   }
      // ];
      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },

  async fetchServiceAccounts(cluster, saved = false) {
    if (saved) {
      return;
    }
    const config = get(cluster, 'gkeConfig');
    const zone = get(config, 'zone') || `${ get(config, 'region') }-b`;
    const neuConfig = { ...config };

    delete neuConfig.region;

    set(neuConfig, 'zone', zone);

    const neuURL = this.parseRequestData('/meta/gkeServiceAccounts', neuConfig, cluster?.id);

    try {
      const xhr = await this.request(neuURL, 'GET');
      const out = xhr.body.items || [];

      return out;
    } catch (error) {
      return reject([error.body.error ?? error.body]);
    }
  },
});
