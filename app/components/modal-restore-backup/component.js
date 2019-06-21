import { inject as service } from '@ember/service';
import { get, set, setProperties, computed } from '@ember/object';
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
  loadingBackups:   false,

  init() {
    this._super(...arguments);

    this.initOwnProperties();
    this.fetchAllBackupsForCluster();
  },

  actions: {
    restore() {
      const { backupId } = this;
      const out          = {};

      if (backupId) {
        set(out, 'etcdBackupId', backupId);

        this.modalOpts.cluster.doAction('restoreFromEtcdBackup', out).then(() => {
          this.send('cancel');
        });
      } else {
        this.growl.fromError(this.intl.t('modalRestoreBackup.error'));
      }
    }
  },

  availableBackups: computed('modalOpts.cluster.etcdbackups.[]', function() {
    return get(this, 'modalOpts.cluster.etcdbackups').map((backup) => {
      let time = moment(get(backup, 'created'));

      return {
        id:      backup.id,
        label:   `${ backup.displayName } ( ${ time.format('MMMM Do YYYY, H:mm:ss') })`,
        created: backup.created,
      }
    }).sortBy('created');
  }),

  initOwnProperties() {
    setProperties(this, {
      backupId: '',
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
