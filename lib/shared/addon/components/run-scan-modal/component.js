import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, observer } from '@ember/object';

export default Component.extend(ModalBase, {
  settings:     service(),
  globalStore:  service(),
  growl:        service(),
  intl:         service(),
  cisHelpers:   service(),
  modalService: service('modal'),

  layout,
  profile: null,

  classNames: ['generic', 'about', 'medium-modal'],

  actions: {
    run() {
      const cluster = get(this, 'modalOpts.cluster');
      const onRun = get(this, 'modalOpts.onRun');
      const intl = get(this, 'intl');

      const profile = this.cisHelpers.cisScanProfiles[get(this, 'profile')];
      const clusterName = get(this, 'modalOpts.cluster.displayName');


      cluster.doAction('runSecurityScan', {
        failuresOnly:             false,
        skip:                     null,
        profile:                  profile.profile,
        overrideBenchmarkVersion: profile.benchmark
      }).then(() => {
        this.growl.success(intl.t('cis.scan.growl.success', { clusterName }), '');
      });

      this.get('modalService').toggleModal();
      (onRun || (() => {}))();
    }
  },

  cisScanProfileOptionsChanged: observer('cisHelpers.cisScanProfileOptions.[]', function() {
    const kubernetesVersion = get(this, 'modalOpts.cluster.rancherKubernetesEngineConfig.kubernetesVersion');
    const defaultOption = this.cisHelpers.getDefaultCisScanProfileOption(kubernetesVersion);

    set(this, 'profile', defaultOption);
  }),
});
