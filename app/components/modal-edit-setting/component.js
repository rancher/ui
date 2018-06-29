import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  settings:   service(),
  growl:      service(),
  layout,
  classNames: ['span-8', 'offset-2'],

  value:      null,
  removing:   false,

  model:      alias('modalService.modalOpts'),

  init() {

    this._super(...arguments);
    this.set('value', this.get('model.obj.value') || '');

  },

  didInsertElement() {

    next(() => {

      if ( this.isDestroyed || this.isDestroying ) {

        return;

      }

      const elem = this.$('.form-control')[0]

      if ( elem ) {

        setTimeout(() => {

          elem.focus();

        }, 250);

      }

    });

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
