import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  showAddCloudCredential: null,
  errors:                 null,
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
