import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

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

    remove() {
      this.set('removing',true);
      let key = this.get('model.key');
      this.get('model.obj').delete({forceRemove: true}).then(() => {
        this.get('settings').load([key]).then(() => {
          this.send('done');
        });
      }).catch((err) => {
        this.get('growl').fromError(err);
      }).finally(() => {
        this.set('removing', false);
      });
    },

    done() {
      this.send('cancel');
    }
  },
});
