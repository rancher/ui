import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import moment from 'moment';

export default Component.extend(ModalBase, {
  growl: service(),

  layout,
  classNames: ['large-modal'],

  etcdBackups: alias('modalOpts.model.etcdbackups'),
  cluster:     alias('modalOpts.model'),

  actions: {
    async rotate(cb) {
      const { cluster } = this;

      try {
        await cluster.doAction('rotateEncryptionKey');

        cb(true);

        this.send('cancel');
      } catch (error) {
        cb(false);
      }
    }
  },

  lastBackup: computed('etcdBackups.@each.created', function() {
    const { etcdBackups } = this;
    const latest = get(etcdBackups, 'firstObject');

    if (!latest) {
      return null;
    }

    const backupName = get(latest, 'displayName');
    const created = moment(get(latest, 'created'));
    const backupTime = created ? created.format('MMMM Do YYYY, HH:mm:ss') : 'N/A';

    return {
      backupName,
      backupTime,
    }
  }),
});
