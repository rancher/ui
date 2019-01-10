import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias } from '@ember/object/computed';
import moment from 'moment';

export default Component.extend(ModalBase, {
  intl:             service(),
  growl:            service(),

  layout,
  classNames:       ['large-modal'],
  backupId:         null,
  availableBackups: null,

  init() {
    this._super(...arguments);

    setProperties(this, {
      backupId: '',
      errors:   [],
    });
  },

  didReceiveAttrs() {
    const etcdBackUps = get(this, 'modalOpts.cluster.etcdbackups');
    const out         = [];

    etcdBackUps.forEach((backup) => {
      let time = moment(get(backup, 'created'));

      out.pushObject({
        id:      backup.id,
        label:   `${ backup.displayName } ( ${ time.format('MMMM Do YYYY, H:mm:ss') })`,
        created: backup.created,
      });
    });

    set(this, 'availableBackups', out.sortBy('created'));
  },

  actions: {
    restore(cb) {
      const { backupId } = this;
      const out = {};

      if (backupId) {
        set(out, 'etcdBackupId', backupId);
        this.modalOpts.cluster.doAction('restoreFromEtcdBackup', out).then(() => {
          this.send('cancel');
        })
          .catch((err) => {
            this.growl.fromError(err);

            if (cb) {
              cb(false);
            }
          });
      } else {
        this.growl.fromError(this.intl.t('modalRestoreBackup.error'));
      }
    }
  },
});
