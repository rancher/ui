import Resource from 'ember-api-store/models/resource';
import { set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import C from 'ui/utils/constants';
const { LONGHORN_PROVISIONER_KEY } = C.STORAGE;

const BETA_ANNOTATION = 'storageclass.beta.kubernetes.io/is-default-class';
const DEFAULT_ANNOTATION = 'storageclass.kubernetes.io/is-default-class';

const PROVISIONERS = [];

registerProvisioner('aws-ebs',         'kubernetes.io/aws-ebs',         true, true);
registerProvisioner('gce-pd',          'kubernetes.io/gce-pd',          true, true);
registerProvisioner('glusterfs',       'kubernetes.io/glusterfs',       true, false);
registerProvisioner('cinder',          'kubernetes.io/cinder',          true, false);
registerProvisioner('vsphere-volume',  'kubernetes.io/vsphere-volume',  true, true);
registerProvisioner('rbd',             'kubernetes.io/rbd',             true, false);
registerProvisioner('quobyte',         'kubernetes.io/quobyte',         true, false);
registerProvisioner('azure-disk',      'kubernetes.io/azure-disk',      true, true);
registerProvisioner('azure-file',      'kubernetes.io/azure-file',      true, true);
registerProvisioner('portworx-volume', 'kubernetes.io/portworx-volume', true, false);
registerProvisioner('scaleio',         'kubernetes.io/scaleio',         true, false);
registerProvisioner('storageos',       'kubernetes.io/storageos',       true, false);
registerProvisioner('longhorn',        LONGHORN_PROVISIONER_KEY,        true, true);
registerProvisioner('local-storage',   'kubernetes.io/no-provisioner',  true, false);

export function registerProvisioner(name, provisioner, component, supported) {
  if ( component === true ) {
    component = name;
  }

  const existing = PROVISIONERS.findBy('name', name);

  if ( existing ) {
    PROVISIONERS.removeObject(existing);
  }

  PROVISIONERS.push({
    name,
    value: provisioner,
    component,
    supported,
  });
}

export function getProvisioners() {
  return JSON.parse(JSON.stringify(PROVISIONERS));
}

export default Resource.extend({
  clusterStore: service(),
  router:       service(),

  type:      'storageClass',
  state: 'active',

  isDefault: computed('annotations', function() {
    const annotations = this.annotations || {};

    return annotations[DEFAULT_ANNOTATION] === 'true' ||
      annotations[BETA_ANNOTATION] === 'true';
  }),

  availableActions: computed('isDefault', function() {
    const isDefault = this.isDefault;

    let out = [
      {
        label:   'action.makeDefault',
        icon:    'icon icon-star-fill',
        action:  'makeDefault',
        enabled: !isDefault
      },
      {
        label:   'action.resetDefault',
        icon:    'icon icon-star-line',
        action:  'resetDefault',
        enabled: isDefault
      },
    ];

    return out;
  }),

  displayProvisioner: computed('provisioner', 'intl.locale', function() {
    const intl = this.intl;
    const provisioner = this.provisioner;
    const entry = PROVISIONERS.findBy('value', provisioner)

    if ( provisioner && entry ) {
      const key = `storageClass.${ entry.name }.title`;

      if ( intl.exists(key) ) {
        return intl.t(key);
      }
    }

    return provisioner;
  }),
  actions: {
    makeDefault() {
      const cur = this.clusterStore.all('storageClass')
        .filterBy('isDefault', true);
      const promises = [];

      cur.forEach((sc) => {
        promises.push(sc.setDefault(false));
      });

      all(promises).then(() => {
        this.setDefault(true);
      });
    },

    resetDefault() {
      this.setDefault(false)
    },

    edit() {
      this.router.transitionTo('authenticated.cluster.storage.classes.detail.edit', this.id);
    },
  },

  setDefault(on) {
    let annotations = this.annotations;

    if ( !annotations ) {
      annotations = {};
      set(this, 'annotations', annotations);
    }

    if ( on ) {
      annotations[DEFAULT_ANNOTATION] = 'true';
      annotations[BETA_ANNOTATION] = 'true';
    } else {
      annotations[DEFAULT_ANNOTATION] = 'false';
      annotations[BETA_ANNOTATION] = 'false';
    }

    this.save();
  },

});
