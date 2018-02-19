import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  scope: service(),
  clusterId: reads('scope.currentCluster.id'),

  init(...args) {
    this._super(...args);
  },

  addNewRecipient() {
    const nue = {
      notifierType: null,
      notifierId: null,
      recipient: null,
    };
    get(this, 'model.recipients').pushObject(nue);
  },

  disableRemove: function() {
    return get(this, 'model.recipients.length') <= 1;
  }.property('model.recipients.length'),

  haveNotifiers: function() {
    return get(this, 'notifiers.length');
  }.property('notifiers.length'),

  actions: {
    add() {
      this.addNewRecipient();
    },
    remove(recipient) {
      get(this, 'model.recipients').removeObject(recipient);
    },
  },
});
