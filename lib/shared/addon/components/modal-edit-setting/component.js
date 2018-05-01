import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get } from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  settings: service(),
  growl: service(),

  classNames: ['span-8', 'offset-2'],
  model: alias('modalService.modalOpts'),

  value: null,
  removing: false,

  init() {
    this._super(...arguments);
    this.set('value', this.get('model.obj.value')||'');
  },

  actions: {
    save(btnCb) {
      this.get('settings').set(normalizeName(this.get('model.key')), this.get('value'));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.send('done');
      });
    },

    done() {
      this.send('cancel');
    }
  },
});
