import { inject as service } from '@ember/service';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import moment from 'moment';

export default Component.extend(ModalBase, {
  intl:             service(),
  growl:            service(),

  layout,
  classNames:       ['large-modal'],
  backupId:         null,
  restoreRkeConfig: null,
  loadingBackups:   false,

  init() {
    this._super(...arguments);

    this.initOwnProperties();
    this.fetchAllBackupsForCluster();
  },

  actions: {
    restore() {
      const { backupId, restoreRkeConfig } = this;
      const out          = {};

      if (backupId) {
        set(out, 'etcdBackupId', backupId);
        if (restoreRkeConfig !== 'etcd') {
          set(out, 'restoreRkeConfig', restoreRkeConfig);
        }

        this.modalOpts.cluster.doAction('restoreFromEtcdBackup', out).then(() => {
          this.send('cancel');
        });
      } else {
        this.growl.fromError(this.intl.t('modalRestoreBackup.error'));
      }
    }
  },

  updateRestoreRkeConfig: observer('backupId', function() {
    const value = get(this, 'backupId') ? 'etcd' : '';

    set(this, 'restoreRkeConfig', value);
  }),

  availableBackups: computed('modalOpts.cluster.etcdbackups.[]', function() {
    return get(this, 'modalOpts.cluster.etcdbackups').map((backup) => {
      let time = moment(get(backup, 'created'));
      const hyphenatedVersion = backup.status.kubernetesVersion
        ? ` - ${ backup.status.kubernetesVersion }`
        : '';

      return {
        id:      backup.id,
        label:   `${ backup.displayName } (${ time.format('MMMM Do YYYY, H:mm:ss') })${ hyphenatedVersion }`,
        created: backup.created,
        state:   backup.state,
      }
    }).sortBy('created').reverse();
  }),

  selectedBackup: computed('modalOpts.cluster.etcdbackups.[]', 'backupId', function() {
    const backupId = get(this, 'backupId');

    return !backupId ? null : get(this, 'modalOpts.cluster.etcdbackups').findBy('id', backupId);
  }),

  selectedVersion: computed('selectedBackup.status.kubernetesVersion', function() {
    return get(this, 'selectedBackup.status.kubernetesVersion') || this.intl.t('modalRestoreBackup.type.versionUnknown');
  }),

  k8sVersionDisabled: computed('selectedVersion', 'restorationTypeDisabled', function() {
    return !get(this, 'restorationTypeDisabled') && get(this, 'selectedVersion') === this.intl.t('modalRestoreBackup.type.versionUnknown');
  }),

  k8sVersionRadioDisabled: computed('k8sVersionDisabled', 'restorationTypeDisabled', function() {
    return get(this, 'k8sVersionDisabled') || get(this, 'restorationTypeDisabled');
  }),

  restorationTypeDisabled: computed('selectedBackup', function() {
    return !get(this, 'selectedBackup');
  }),

  initOwnProperties() {
    const backupId = this.modalOpts.selection ? this.modalOpts.selection.id : '';
    const restoreRkeConfig = backupId ? 'etcd' : '';

    setProperties(this, {
      backupId,
      restoreRkeConfig,
      errors:   [],
    });
  },

  fetchAllBackupsForCluster() {
    set(this, 'loadingBackups', true);

    this.modalOpts.cluster.store.findAll('etcdbackup')
      .finally(() => {
        set(this, 'loadingBackups', false);
      });
  },
});
