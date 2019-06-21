import { get, set, computed, observer } from '@ember/object';

import Component from '@ember/component';

export default Component.extend({
  disableRemove: false,

  actions: {
    remove() {
      if (!get(this, 'disableRemove')) {
        this.remove(this.model);
      }
    },
  },

  setRecipient: observer('selectedNotifier.{notifierValue,notifierType}', function() {
    const v = get(this, 'selectedNotifier.notifierValue');
    const t = get(this, 'selectedNotifier.notifierType');

    set(this, 'model.recipient', v);
    set(this, 'model.notifierType', t);
  }),

  selectedNotifier: computed('model.notifierId', 'notifiers.[]', function() {
    return get(this, 'notifiers')
      .filterBy('id', get(this, 'model.notifierId'))
      .get('firstObject');
  }),

  remove() {
    throw new Error('remove action is required!');
  }
});
