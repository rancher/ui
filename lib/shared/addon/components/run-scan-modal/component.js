import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, computed } from '@ember/object';

export default Component.extend(ModalBase, {
  settings:     service(),
  globalStore:  service(),
  growl:        service(),
  intl:         service(),
  modalService: service('modal'),

  layout,
  profile: null,

  classNames: ['generic', 'about', 'medium-modal'],

  actions: {
    run() {
      const cluster = get(this, 'modalOpts.cluster');
      const onRun = get(this, 'modalOpts.onRun');
      const intl = get(this, 'intl');

      cluster.doAction('runSecurityScan', {
        failuresOnly: false,
        skip:         null
      }).then(() => {
        this.growl.success(intl.t('cis.scan.growl.success', { clusterName: get(this, 'name') }), '');
      });

      this.get('modalService').toggleModal();
      (onRun || (() => {}))();
    }
  },
  cisScanProfileOptions: computed(() => {
    return [
      {
        label:   'RKE-CIS-1.4 Permissive',
        value: 'rke-cis-1.4-permissive'
      },
      {
        label:   'RKE-CIS-1.4 Hardened',
        value: 'rke-cis-1.4-hardened'
      }
    ]
  }),

});
