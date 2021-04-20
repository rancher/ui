import Component from '@ember/component';
import layout from './template';
import ModalBase from 'shared/mixins/modal-base';
import { get, computed, set } from '@ember/object';
import { parseSi } from 'shared/utils/parse-unit';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  scope: service(),
  layout,

  classNames: ['medium-modal'],

  model: null,

  didReceiveAttrs() {
    const model = get(this, 'modalOpts.model').clone();

    set(this, 'model', model);
  },

  actions: {
    save(cb) {
      get(this, 'model').save().then(() => {
        this.send('cancel');
      }).finally(() => {
        cb();
      });
    },
  },

  storage: computed('model.resources.requests.storage', {
    get() {
      const capacity = get(this, 'model.resources.requests.storage');
      const bytes = parseSi(capacity);
      const gib = bytes / (1024 ** 3);

      return gib;
    },
    set(key, value) {
      const { resources } = this.model;

      set(resources, 'requests.storage', `${ value  }Gi`);

      return value;
    },
  }),

});
