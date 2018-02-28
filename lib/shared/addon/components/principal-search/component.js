import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import { get, set, computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import SearchableSelect from '../searchable-select/component';

const DEBOUNCE_MS = 250;
export default SearchableSelect.extend({
  globalStore: service(),
  errors: null,
  content: null,
  init() {
    this._super(...arguments);
    get(this, 'globalStore').findAll('principal').then( p => {
      set(this, 'content', p.map(( user ) =>{
        return {
          label: get(user, 'displayName'),
          value: get(user, 'id')
        };
      }));
      console.log('content', get(this, 'content'))
    })
  },

  actions: {
    search(term) {
      console.log(term)
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
          // let principal = get(xhr, 'body.data.firstObject');
          // set(principal, 'ignore', true);
          // set(this, 'addInput', '');
          // get(this, 'globalStore')._add('principal', principal);
          // this.send('addObject', get(principal, 'id'));
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
