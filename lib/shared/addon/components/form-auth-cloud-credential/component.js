import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  showAddCloudCredential: null,
  errors:                 null,
  region:                 null, // only used a passthrough for the amazon region so the region selection can happen in cloud creds rather than have the markup on both pages
  hideSave:               false,

  createLabel:            'saveCancel.create',
  savingLabel:            'generic.loading',

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
});
