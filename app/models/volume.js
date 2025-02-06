import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

const SOURCES = [];

//             name/component    field                     component ephemeral persistent supported driver
registerSource('aws-ebs',             'awsElasticBlockStore',   true, true,  true,  true);
registerSource('azure-disk',          'azureDisk',              true, true,  true,  true);
registerSource('azure-file',          'azureFile',              true, true,  true,  true);
registerSource('csi',                 'csi',                    true, true,  true,  false);
registerSource('cephfs',              'cephfs',                 true, true,  true,  false);
registerSource('cinder',              'cinder',                 true, true,  true,  false);
registerSource('config-map',          'configMap',              true, false, false, false);
// registerSource('downward-api',     'downwardAPI',            true, true,  false, false);
registerSource('empty-dir',           'emptyDir',               true, true,  false, false);
registerSource('fc',                  'fc',                     true, true,  true,  false);
registerSource('flex-volume',         'flexVolume',             true, true,  true,  false);
registerSource('csi-volume-longhorn', 'csi',                    true, true,  true,  true, C.STORAGE.LONGHORN_PROVISIONER_KEY);
registerSource('flocker',             'flocker',                true, true,  true,  false);
registerSource('gce-pd',              'gcePersistentDisk',      true, true,  true,  true);
// registerSource('git-repo',         'gitRepo',                true, true,  false, false);
registerSource('glusterfs',           'glusterfs',              true, true,  true,  false);
registerSource('host-path',           'hostPath',               true, true,  true,  true);
registerSource('iscsi',               'iscsi',                  true, true,  true,  false);
registerSource('local',               'local',                  true, false, true,  true);
registerSource('nfs',                 'nfs',                    true, true,  true,  true);
// registerSource('pvc',              'persisitentVolumeClaim', true, true,  false, false);
registerSource('photon',              'photonPersistentDisk',   true, true,  true,  false);
registerSource('portworx',            'portworxVolume',         true, true,  true,  false);
// registerSource('projected',        'projected',              true, true,  false, false);
registerSource('quobyte',             'quobyte',                true, true,  true,  false);
registerSource('rbd',                 'rbd',                    true, true,  true,  false);
registerSource('scaleio',             'scaleIO',                true, true,  true,  false);
registerSource('secret',              'secret',                 true, true,  false, false);
registerSource('storageos',           'storageos',              true, true,  true,  false);
registerSource('vsphere-volume',      'vsphereVolume',          true, true,  true,  true);

export function registerSource(name, field, component, ephemeral = true, persistent = true, supported = false, driver = '') {
  if ( component === true ) {
    component = name;
  }

  const existing = SOURCES.findBy('name', name);

  if ( existing ) {
    SOURCES.removeObject(existing);
  }

  SOURCES.push({
    name,
    value:      field,
    driver,
    component,
    ephemeral:  !!ephemeral,
    persistent: !!persistent,
    supported:  !!supported,
  });
}

export function getSources(which = 'all') {
  if (which === 'ephemeral') {
    return JSON.parse(JSON.stringify(SOURCES.filter((s) => s.ephemeral)));
  } else if ( which === 'persistent' ) {
    return JSON.parse(JSON.stringify(SOURCES.filter((s) => s.persistent)));
  } else {
    return JSON.parse(JSON.stringify(SOURCES));
  }
}

var Volume = Resource.extend({
  intl:         service(),
  reservedKeys: ['configName'],
  sources:      SOURCES,

  type: 'volume',

  configName: computed('sources.@each.value', 'state', function() {
    const keys = this.sources.map((x) => x.value);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( get(this, key) ) {
        return key;
      }
    }

    return null;
  }),

  config: computed('configName', function() {
    const key = this.configName;

    if ( key ) {
      return get(this, key);
    }

    return;
  }),

  sourceName: computed('configName', 'sources', function(){
    const key = this.configName;

    if ( !key ) {
      return;
    }

    let entry;
    let driver    = get(this, key).driver;
    const sources = this.sources;

    entry = sources.findBy('value', key);

    if (key === 'flexVolume' && driver){
      let specialSource = sources.findBy('driver', driver);

      if (specialSource){
        entry = specialSource;
      }
    }

    if (entry){
      return entry.name;
    }

    return;
  }),

  displaySource: computed('csi.driver', 'intl.locale', 'sourceName', function() {
    const intl       = this.intl;
    const sourceName = this.sourceName;

    if ( sourceName === 'csi' ) {
      return get(this, 'csi.driver')
    } else {
      return intl.t(`volumeSource.${ sourceName }.title`);
    }
  }),

  clearSourcesExcept(keep) {
    const keys = this.sources.map((x) => x.value);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this, key) ) {
        set(this, key, null);
      }
    }

    if ( keep === 'csi' ) {
      this.clearCsiSecretRef();
    }
  },

  clearCsiSecretRef() {
    const csi = this.csi;

    Object.keys(csi).filter((key) => key.endsWith('SecretRef')).forEach((key) => {
      const ref = csi[key];

      if ( !ref.name && !ref.namespace ) {
        delete csi[key]
      }
    });
  }
});

Volume.reopenClass({
  stateMap: {
    'active':           {
      icon:  'icon icon-hdd',
      color: 'text-success'
    },
  },
});

export default Volume;
