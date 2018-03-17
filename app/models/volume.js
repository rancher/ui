import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

const SOURCES = [];
registerSource('aws-ebs',        'awsElasticBlockStore', true);
registerSource('azure-disk',     'azureDisk',            '');
registerSource('azure-file',     'azureFile',            '');
registerSource('cephfs',         'cephfs',               '');
registerSource('cinder',         'cinder',               '');
registerSource('fc',             'fc',                   '');
registerSource('flex-volume',    'flexVolume',           '');
registerSource('flocker',        'flocker',              '');
registerSource('gce-pd',         'gcePersistentDisk',    '');
registerSource('glusterfs',      'glusterfs',            '');
registerSource('host-path',      'hostPath',             '');
registerSource('iscsi',          'iscsi',                '');
registerSource('local',          'local',                '');
registerSource('nfs',            'nfs',                  '');
registerSource('photon',         'photonPersistentDisk', '');
registerSource('portworx',       'portworxVolume',       '');
registerSource('quobyte',        'quobyte',              '');
registerSource('rbd',            'rbd',                  '');
registerSource('scaleio',        'scaleIO',              '');
registerSource('storageos',      'storageos',            '');
registerSource('vsphere-volume', 'vsphereVolume',        '');

export function registerSource(name, field, component) {
  if ( component === true ) {
    component = name;
  }

  const existing = SOURCES.findBy('name', name);
  if ( existing ) {
    SOURCES.removeObject(existing);
  }

  SOURCES.push({
    name: name,
    value: field,
    component: component,
  });
}

export function getSources() {
  return JSON.parse(JSON.stringify(SOURCES));
}

var Volume = Resource.extend({
  intl: service(),
  reservedKeys: ['configName'],

  type: 'volume',

  init() {
    this._super(...arguments);

    const keys = SOURCES.map(x => x.value);

    set(this, 'configName', computed.call(this, ...keys, function() {
      for ( let key, i = 0 ; i < keys.length ; i++ ) {
        key = keys[i];
        if ( get(this,key) ) {
          return key;
        }
      }

      return null;
    }));
  },

  config: computed('configName', function() {
    const key = get(this, 'configName');
    if ( key ) {
      return get(this, key);
    }
  }),

  displaySource: computed('configName','intl.locale', function() {
    const intl = get(this, 'intl');
    const key = get(this, 'configName');
    const entry = SOURCES.findBy('value', key);

    if ( key ) {
      return intl.t(`volumeSource.${entry.name}.title`);
    }
  }),

  clearSourcesExcept(keep) {
    const keys = SOURCES.map(x => x.value);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this,key) ) {
        set(this, key, null);
      }
    }
  },
});

Volume.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
