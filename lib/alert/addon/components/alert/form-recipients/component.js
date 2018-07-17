import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  globalStore: service(),
  scope:       service(),
  clusterId:   reads('scope.currentCluster.id'),

  notifiers: function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('notifier').filterBy('clusterId', clusterId);
  }.property('clusterId'),

  disableRemove: function() {
    return get(this, 'model.recipients.length') <= 1;
  }.property('model.recipients.length'),

  haveNotifiers: function() {
    return get(this, 'notifiers.length');
  }.property('notifiers.length'),

  init(...args) {
    this._super(...args);
  },

  actions: {
    add() {
      this.addNewRecipient();
    },
    remove(recipient) {
      get(this, 'model.recipients').removeObject(recipient);
    },
  },
  addNewRecipient() {
    const nue = {
      notifierType: null,
      notifierId:   null,
      recipient:    null,
    };

    get(this, 'model.recipients').pushObject(nue);
  },

});
