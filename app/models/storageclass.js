import Resource from '@rancher/ember-api-store/models/resource';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

const BETA_ANNOTATION = 'storageclass.beta.kubernetes.io/is-default-class';
const DEFAULT_ANNOTATION = 'storageclass.kubernetes.io/is-default-class';

const PROVISIONERS = [];

registerProvisioner('aws-ebs',        'kubernetes.io/aws-ebs',         true);
registerProvisioner('gce-pd',         'kubernetes.io/gce-pd',          true);
registerProvisioner('glusterfs',      'kubernetes.io/glusterfs',       true);
registerProvisioner('cinder',         'kubernetes.io/cinder',          true);
registerProvisioner('vsphere-volume', 'kubernetes.io/vsphere-volume',  true);
registerProvisioner('rbd',            'kubernetes.io/rbd',             true);
registerProvisioner('quobyte',        'kubernetes.io/quobyte',         true);
registerProvisioner('azure-disk',     'kubernetes.io/azure-disk',      true);
registerProvisioner('azure-file',     'kubernetes.io/azure-file',      true);
registerProvisioner('portworx-volume', 'kubernetes.io/portworx-volume', true);
registerProvisioner('scaleio',        'kubernetes.io/scaleio',         true);
registerProvisioner('storageos',      'kubernetes.io/storageos',       true);
registerProvisioner('longhorn',      'rancher.io/longhorn',       true);

export function registerProvisioner(name, provisioner, component) {
  if ( component === true ) {
    component = name;
  }

  const existing = PROVISIONERS.findBy('name', name);

  if ( existing ) {
    PROVISIONERS.removeObject(existing);
  }

  PROVISIONERS.push({
    name,
    value:     provisioner,
    component,
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
    const annotations = get(this, 'annotations') || {};

    return annotations[DEFAULT_ANNOTATION] === 'true' ||
      annotations[BETA_ANNOTATION] === 'true';
  }),

  availableActions: computed('isDefault', function() {
    const isDefault = get(this, 'isDefault');

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
    const intl = get(this, 'intl');
    const provisioner = get(this, 'provisioner');
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
      const cur = get(this, 'clusterStore').all('storageClass')
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
      get(this, 'router').transitionTo('authenticated.cluster.storage.classes.detail.edit', get(this, 'id'));
    },
  },

  setDefault(on) {
    let annotations = get(this, 'annotations');

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
