import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import { get, set, computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import SearchableSelect from '../searchable-select/component';
import { alias } from '@ember/object/computed';

const DEBOUNCE_MS = 250;
export default SearchableSelect.extend({
  globalStore: service(),
  errors: null,
  content: alias('filteredPrincipals'),
  _principals: null,
  filteredPrincipals: computed('_principals.@each.{id,state}', function() {
    // console.log('_principals', (get(this, '_principals')||[]).sortBy('displayName'));
    return get(this, '_principals').map(( user ) =>{
      return {
        label: get(user, 'displayName'),
        value: get(user, 'id')
      };
    }).sortBy('displayName');
  }),
  init() {
    set(this, '_principals', get(this, 'globalStore').all('principal'));
    get(this, 'globalStore').findAll('principal');
    this._super(...arguments);
  },

  actions: {
    search(term) {
      // console.log(term)
      get(this, 'search').perform(term);
    },
  },

  noMatch: computed('filtered.[]', function() {
    return get(this, 'filtered.length');
  }),

  missingMessage: computed('content.[]', function() {

    let len = get(this, 'content.length')
    let out = '';
    let task = get(this, 'search');

    // console.log('running', task.numRunning)
    if (len) {
      if (len >= 0 && task.numRunning === 0) {
        out = 'searchableSelect.noMatch';
      } else {
        out = 'generic.searching';
      }
    } else {
      out = 'searchableSelect.noOptions';
    }

    return out;
  }),

  search: task(function * (term) {
    if (isBlank(term)) { return []; }

    // Pause here for DEBOUNCE_MS milliseconds. Because this
    // task is `restartable`, if the user starts typing again,
    // the current search will be canceled at this point and
    // start over from the beginning. This is the
    // ember-concurrency way of debouncing a task.
    yield timeout(DEBOUNCE_MS);

    let xhr = yield this.get('goSearch').perform(term);
    // debugger;
    return xhr;
  }).restartable(),

  goSearch: task(function * (term) {
    let promise;

    try {
      promise = get(this, 'globalStore').rawRequest({
        url: 'principals?action=search',
        method: 'POST',
        data: {
          name: term,
        }
      }).then((xhr) => {
        if ( xhr.status === 204 ) {
          return;
        }

        if ( xhr.body && typeof xhr.body === 'object' ) {
          let neu = xhr.body.content.map(( user ) =>{
            return {
              label: get(user, 'displayName'),
              value: get(user, 'id')
            };
          })
          if (neu && neu.length > 0) {
            get(this, 'content').pushObjects(neu);
          }
        }
        return xhr;
      }).catch((xhr) => {
        set(this, 'errors', [`${xhr.status}: ${xhr.statusText}`]);
        return xhr;
      });
    } finally {
      set(this, 'checking', false);
    }

    let result = yield promise;

    return result;
  }),
});
