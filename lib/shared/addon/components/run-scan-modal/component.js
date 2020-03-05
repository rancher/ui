import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, computed } from '@ember/object';

export default Component.extend(ModalBase, {
  settings:     service(),
  globalStore:  service(),
  growl:        service(),
  intl:         service(),
  modalService: service('modal'),

  layout,
  profile: null,

  classNames: ['generic', 'about', 'medium-modal'],

  init() {
    this._super(...arguments);

    set(this, 'profile', get(this, 'modalOpts.cluster.cisScanProfileOptions.first.value'));
  },

  actions: {
    run() {
      const cluster = get(this, 'modalOpts.cluster');
      const onRun = get(this, 'modalOpts.onRun');
      const intl = get(this, 'intl');

      const profile = get(this, 'modalOpts.cluster.cisScanProfiles')[get(this, 'profile')];

      cluster.doAction('runSecurityScan', {
        failuresOnly:             false,
        skip:                     null,
        profile:                  profile.profile,
        overrideBenchmarkVersion: profile.benchmark
      }).then(() => {
        this.growl.success(intl.t('cis.scan.growl.success', { clusterName: get(this, 'name') }), '');
      });

      this.get('modalService').toggleModal();
      (onRun || (() => {}))();
    }
  },
});
