import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';
import { get, set, computed } from '@ember/object';


export default Component.extend({
  layout,
  secrets:     null,
  _allSecrets: null,
  intl:        service(),
  store:       service('store'),
  statusClass: null,
  fetching:    false,
  editing:     true,

  actions: {
    addSecret() {
      let secret = {source: 'secret'};
      get(this, 'secrets').addObject(secret);
    },
    removeSecret(secret) {
      get(this, 'secrets').removeObject(secret);
    },
  },

  init() {
    set(this, '_allSecrets', get(this, 'store').all('secret'));
    get(this, 'store').find('secret');

    this._super(...arguments);

    if (!get(this, 'secrets') ) {
      set(this, 'secrets', [])
    }

  },

  status: computed('secrets.@each.secretId','errors.length', function() {
    let k = STATUS.NONE;
    let count = get(this, 'secrets.length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ){
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }),
});
