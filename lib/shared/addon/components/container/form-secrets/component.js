import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { task } from 'ember-concurrency';


export default Component.extend({
  layout,
  secrets: null,
  _allSecrets: null,
  intl:        service(),
  store: service('store'),
  statusClass: null,
  fetching: false,
  editing: true,

  actions: {
    addSecret() {
      let secret = {
        source: 'secret',
        sourceName: null,
        targetKey: null,
      };
      get(this, 'secrets').addObject(secret);
    },
    removeSecret(secret) {
      console.log('removed', secret);
    },
  },

  init() {
    this._super(...arguments);
    //TODO you can do this better, its blocking
    set(this, '_allSecrets', get(this, 'store').all('secret'));
    get(this, 'store').find('secret');
    if (!get(this, 'secrets') ) {
      set(this, 'secrets', [])
    }
  },

  status: computed('secrets.@each.secretId','errors.length', function() {
    // TODO refactor for new struct
    let k = STATUS.NONE;
    let count = (this.get('secrets')||[]).filter((x) => !!get(x, 'secretId')).get('length') || 0;

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
