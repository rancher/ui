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
  changeCloudCredential:          null,

  createLabel:                    'saveCancel.create',
  savingLabel:                    'generic.loading',
  mode:                           'new',
  cloudCredentialKey:             'cloudCredentialId',

  init() {
    this._super(...arguments);

    if (this.mode === 'new') {
      this.initSingleOrAddCredential();
    }
  },

  actions: {
    setCloudCredential(cred) {
      if (this.changeCloudCredential) {
        // send the entire credential to match the signature of doneSaving...
        this.changeCloudCredential((this.cloudCredentials || []).find((cc) => cc.id === cred));
      } else {
        const { primaryResource, cloudCredentialKey } = this;

        set(primaryResource, cloudCredentialKey, cred);
      }
    },
    doneSavingCloudCredential(cred) {
      if (cred) {
        if (this.finishAndSelectCloudCredential) {
          this.finishAndSelectCloudCredential(cred);
        }

        set(this, 'showAddCloudCredential', false);
      }
    },
    addCloudCredential() {
      const { primaryResource = {}, cloudCredentialKey } = this;

      if (get(primaryResource, cloudCredentialKey)) {
        this.send('setCloudCredential', null);
      }

      set(this, 'showAddCloudCredential', true);
    },
    cancleNewCloudCredential() {
      set(this, 'showAddCloudCredential', false);
    },
  },

  initSingleOrAddCredential() {
    let {
      cloudCredentials = [], primaryResource, cloudCredentialKey
    } = this;
    let singleCloudCredentialId   = get((cloudCredentials || []), 'firstObject.id') || null;
    const cloudCredentialValue = get((primaryResource || {}), cloudCredentialKey);

    if (isEmpty(get(this, 'cloudCredentials'))) {
      next(() => {
        set(this, 'showAddCloudCredential', true);
      });
    }

    next(() => {
      if ( primaryResource && ( !cloudCredentialValue || !cloudCredentials.find((c) => c.id === cloudCredentialValue)) ) {
        this.send('setCloudCredential', singleCloudCredentialId);
      }
    });
  },
});
