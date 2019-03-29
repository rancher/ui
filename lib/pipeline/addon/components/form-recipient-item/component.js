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

  setRecipient: observer('selectedNotifier', function() {
    const v = get(this, 'selectedNotifier.notifierValue');

    set(this, 'model.recipient', v);
  }),

  selectedNotifier: computed('model.notifier', 'notifiers.[]', function() {
    return get(this, 'notifiers')
      .filterBy('id', get(this, 'model.notifier'))
      .get('firstObject');
  }),

  remove() {
    throw new Error('remove action is required!');
  }
});
