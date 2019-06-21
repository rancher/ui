import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';

const SOURCES = [];

//             name/component    field                     component ephemeral persistent driver
registerSource('aws-ebs',              'awsElasticBlockStore',   true, true,  true);
registerSource('azure-disk',           'azureDisk',              true, true,  true);
registerSource('azure-file',           'azureFile',              true, true,  true);
registerSource('cephfs',               'cephfs',                 true, true,  true);
registerSource('cinder',               'cinder',                 true, true,  true);
registerSource('config-map',           'configMap',              true, false, false);
// registerSource('downward-api',      'downwardAPI',            true, true,  false);
registerSource('empty-dir',            'emptyDir',               true, true,  false);
registerSource('fc',                   'fc',                     true, true,  true);
registerSource('flex-volume',          'flexVolume',             true, true,  true);
registerSource('flex-volume-longhorn', 'flexVolume',             true, true,  true, 'rancher.io/longhorn');
registerSource('flocker',              'flocker',                true, true,  true);
registerSource('gce-pd',               'gcePersistentDisk',      true, true,  true);
// registerSource('git-repo',          'gitRepo',                true, true,  false);
registerSource('glusterfs',            'glusterfs',              true, true,  true);
registerSource('host-path',            'hostPath',               true, true,  true);
registerSource('iscsi',                'iscsi',                  true, true,  true);
registerSource('local',                'local',                  true, false, true);
registerSource('nfs',                  'nfs',                    true, true,  true);
// registerSource('pvc',               'persisitentVolumeClaim', true, true,  false);
registerSource('photon',               'photonPersistentDisk',   true, true,  true);
registerSource('portworx',             'portworxVolume',         true, true,  true);
// registerSource('projected',         'projected',              true, true,  false);
registerSource('quobyte',              'quobyte',                true, true,  true);
registerSource('rbd',                  'rbd',                    true, true,  true);
registerSource('scaleio',              'scaleIO',                true, true,  true);
registerSource('secret',               'secret',                 true, true,  false);
registerSource('storageos',            'storageos',              true, true,  true);
registerSource('vsphere-volume',       'vsphereVolume',          true, true,  true);

export function registerSource(name, field, component, ephemeral = true, persistent = true, driver = '') {
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

  configName: computed('sources.@each.{value}', function() {
    const keys = get(this, 'sources').map((x) => x.value);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( get(this, key) ) {
        return key;
      }
    }

    return null;
  }),

  config: computed('configName', function() {
    const key = get(this, 'configName');

    if ( key ) {
      return get(this, key);
    }
  }),

  sourceName: computed('configName', function(){
    const key = get(this, 'configName');

    if ( !key ) {
      return
    }

    let entry;
    let driver    = get(this, key).driver;
    const sources = get(this, 'sources');

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
  }),

  displaySource: computed('sourceName', 'intl.locale', function() {
    const intl       = get(this, 'intl');
    const sourceName = get(this, 'sourceName');

    if ( sourceName ) {
      return intl.t(`volumeSource.${ sourceName }.title`);
    }
  }),

  clearSourcesExcept(keep) {
    const keys = get(this, 'sources').map((x) => x.value);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this, key) ) {
        set(this, key, null);
      }
    }
  },
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
