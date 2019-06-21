import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  globalStore: service(),
  scope:       service(),
  clusterId:   reads('scope.currentCluster.id'),

  init(...args) {
    this._super(...args);
    const recipients = get(this, 'model.recipients')

    if (!recipients) {
      set(this, 'model.recipients', [])
      this.addNewRecipient();
    }
  },

  actions: {
    add() {
      this.addNewRecipient();
    },
    remove(recipient) {
      get(this, 'model.recipients').removeObject(recipient);
    },
  },
  notifiers: computed('clusterId', function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('notifier').filterBy('clusterId', clusterId);
  }),

  haveNotifiers: computed('notifiers.length', function() {
    return get(this, 'notifiers.length');
  }),

  addNewRecipient() {
    const nue = {
      notifierType: null,
      notifierId:   null,
      recipient:    null,
    };

    get(this, 'model.recipients').pushObject(nue);
  },

});
