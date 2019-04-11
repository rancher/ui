import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  layout,
  showAddCloudCredential:         null,
  region:                         null, // only used a passthrough for the amazon region so the region selection can happen in cloud creds rather than have the markup on both pages
  hideSave:                       false,
  cloudCredentials:               null,
  driverName:                     null,
  primaryResource:                null,
  finishAndSelectCloudCredential: null,
  progressStep:                   null,
  cancel:                         null,

  createLabel:                    'saveCancel.create',
  savingLabel:                    'generic.loading',
  mode:                           'new',

  init() {
    this._super(...arguments);

    this.initSingleOrAddCredential();
  },

  actions: {
    doneSavingCloudCredential(cred) {
      if (cred) {
        get(this, 'finishAndSelectCloudCredential')(cred)

        set(this, 'showAddCloudCredential', false);
      }
    },
    addCloudCredential() {
      set(this, 'showAddCloudCredential', true);
    },
    cancleNewCloudCredential() {
      set(this, 'showAddCloudCredential', false);
    },
  },

  initSingleOrAddCredential() {
    let { cloudCredentials = [], primaryResource } = this;
    let singleCloudCredentialId   = get((cloudCredentials || []), 'firstObject.id') || null;

    if (isEmpty(get(this, 'cloudCredentials'))) {
      next(() => {
        set(this, 'showAddCloudCredential', true);
      });
    }

    next(() => {
      if (primaryResource && !primaryResource.cloudCredentialId) {
        set(this, 'primaryResource.cloudCredentialId', singleCloudCredentialId);
      }
    });
  },
});
