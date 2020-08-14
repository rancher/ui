import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, observer, computed } from '@ember/object';

export default Component.extend(ModalBase, {
  settings:           service(),
  globalStore:        service(),
  growl:              service(),
  intl:               service(),
  cisHelpers:         service(),
  securityScanConfig: service(),
  modalService:       service('modal'),

  layout,
  profile: null,
  loading: true,

  classNames: ['generic', 'about', 'medium-modal'],

  init() {
    this._super(...arguments);
    this.updateProfile();
    this.securityScanConfig.loadAsyncConfigMap(get(this, 'modalOpts.cluster')).then(() => set(this, 'loading', false));
  },

  actions: {
    run() {
      const cluster = get(this, 'modalOpts.cluster');
      const onRun = get(this, 'modalOpts.onRun');
      const intl = get(this, 'intl');

      const profile = get(this, 'profileObject');
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
    this.updateProfile();
  }),

  profileObject: computed('profile', function() {
    return this.cisHelpers.cisScanProfiles[get(this, 'profile')];
  }),

  testsNotRunning: computed('cisHelpers.benchmarkLookup', 'profileObject', function() {
    const benchmarkLookup = get(this, 'cisHelpers.benchmarkLookup');
    const profile = get(this, 'profileObject');

    if (!benchmarkLookup || !profile) {
      return {};
    }
    const mapping = benchmarkLookup[profile.benchmark];

    if (!mapping) {
      return {};
    }

    const skippedChecks = profile.profile !== 'hardened'
      ? mapping.skippedChecks
      : [];

    return {
      skippedChecks,
      notApplicableChecks: mapping.notApplicableChecks,
      userSkippedChecks:   mapping.userSkippedChecks.join(', ')
    } ;
  }),
  profileDocsHtml: computed(function() {
    return this.intl.t('cis.scan.modal.profileDocs');
  }),
  testDocsHtml: computed(function() {
    return this.intl.t('cis.scan.modal.testDocs');
  }),
  updateProfile() {
    if (this.cisHelpers.cisScanProfileOptions.length > 0) {
      const kubernetesVersion = get(this, 'modalOpts.cluster.rancherKubernetesEngineConfig.kubernetesVersion');
      const defaultOption = this.cisHelpers.getDefaultCisScanProfileOption(kubernetesVersion);

      set(this, 'profile', defaultOption);
    }
  },

});
