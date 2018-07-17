import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';

export default Component.extend(ModalBase, {
  settings:        service(),
  layout,
  classNames:      ['generic', 'medium-modal'],
  primaryResource: alias('modalOpts.setting'),
  setting:         alias('primaryResource'),
  kind:            alias('modalOpts.kind'),

  actions: {
    save(btnCb) {
      let pr = get(this, 'primaryResource');

      set(pr, 'value', get(pr, 'default') || '');

      pr.save().then(() => {
        btnCb(true);
        this.send('done');
      }).catch((err) => {
        btnCb(err);
      })
    },

    done() {
      this.send('cancel');
    }
  },

});
