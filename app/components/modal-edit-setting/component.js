import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';
import { normalizeName } from 'ui/services/settings';

export default ModalBase.extend({
  settings: Ember.inject.service(),
  growl: Ember.inject.service(),

  classNames: ['lacsso', 'modal-container', 'span-8', 'offset-2'],
  model: Ember.computed.alias('modalService.modalOpts'),

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
