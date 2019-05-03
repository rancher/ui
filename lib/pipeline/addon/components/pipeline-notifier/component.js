import Component from '@ember/component';
import layout from './template'
import {
  get, set, observer, computed, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import C from 'ui/utils/constants';
import { next } from '@ember/runloop'

const CONDITION_CHOICES = [C.CONDITION.SUCCESS, C.CONDITION.CHANGED, C.CONDITION.FAILED]

export default Component.extend({
  globalStore: service(),
  scope:            service(),
  layout,

  config:     null,

  conditionContent:     CONDITION_CHOICES,
  recipients:           [],
  success:              false,
  changed:              false,
  failed:               false,
  customizeMessage:     false,
  togglingNotification: null,

  clusterId:   reads('scope.currentCluster.id'),

  init() {
    this._super(...arguments);
    const { clusterId, config } = this

    get(this, 'globalStore').findAll('notifier').then((res) => {
      set(this, 'notifiers', res.filterBy('clusterId', clusterId))
    })
    if ( config ) {
      const { condition = [] } = config

      condition.map((c) => {
        switch (c) {
        case C.CONDITION.SUCCESS:
          set(this, 'success', true)
          break;
        case C.CONDITION.CHANGED:
          set(this, 'changed', true)
          break;
        case C.CONDITION.FAILED:
          set(this, 'failed', true)
          break;
        default: break;
        }
      })
    }
    this.conditionChange()
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const condition = get(this, 'config.condition') || []

    if (condition.length > 0) {
      next(() => {
        set(this, 'notificationEnabled', true)
      });
    }
  },

  actions: {
    add() {
      this.addNewRecipient();
    },
    remove(recipient) {
      get(this, 'config.recipients').removeObject(recipient);
    },
    toogleMessage() {
      set(this, 'customizeMessage', true)
    },
    disableNotification() {
      setProperties(this, {
        notificationEnabled: false,
        config:              {},
        failed:              false,
        success:             false,
        changed:             false,
      })
    },
    enableNotification() {
      if (!get(this, 'config') || !get(this, 'config.recipients')) {
        set(this, 'config', { recipients: [] })
        set(this, 'success', true)
        this.addNewRecipient()
      }
      set(this, 'notificationEnabled', true);
    },
  },

  conditionChange: observer('success', 'changed', 'failed', function() {
    const arr = [
      get(this, 'success') ? C.CONDITION.SUCCESS : null,
      get(this, 'changed') ? C.CONDITION.CHANGED : null,
      get(this, 'failed') ? C.CONDITION.FAILED : null,
    ].filter((c) => !!c)

    if (get(this, 'config')) {
      set(this, 'config.condition', arr)
    }
  }),

  notifiers: computed('clusterId', function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('notifier').filterBy('clusterId', clusterId);
  }),

  haveNotifiers: computed('notifiers.[]', function() {
    return get(this, 'notifiers').length === 0 ? false : true;
  }),


  addNewRecipient() {
    const nue = {
      notifier:   null,
      recipient:    null,
    };

    get(this, 'config.recipients').pushObject(nue);
  },

});
