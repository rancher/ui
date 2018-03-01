import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import { get, set, computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import SearchableSelect from '../searchable-select/component';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';

const DEBOUNCE_MS = 250;
export default SearchableSelect.extend({
  globalStore: service(),
  errors: null,
  content: alias('filteredPrincipals'),
  value: alias('filter'),
  _principals: null,
  _ourPrincipals: null,
  useLabel: null,
  filteredPrincipals: computed('_principals.@each.{id,state}', function() {
    // console.log('_principals', (get(this, '_principals')||[]));
    return get(this, '_principals').map(( user ) =>{
      // console.log(user.type, user.provider);
      return {
        label: get(user, 'displayName') || get(user, 'loginName') || get(user, 'name'),
        value: get(user, 'id'),
        provider: get(user, 'provider'),
      };
    }).sortBy('displayName');
  }),
  init() {
    set(this, '_principals', get(this, 'globalStore').all('principal'));
    get(this, 'globalStore').findAll('principal').then((principals) => {
      set(this, '_ourPrincipals', principals);
    });
    this._super(...arguments);
  },

  actions: {
    search(term) {
      // console.log(term)
      get(this, 'search').perform(term);
    },
    hide() {
      // debugger;
      set(this, 'filter', get(this, 'displayLabel'))
      this.set('showOptions', false);
      this.set('$activeTarget', null);
    },
  },

  setSelect(item) {
    const gp = this.get('optionGroupPath');
    const vp = this.get('optionValuePath');

    this.set('value', get(item, vp));
    if (gp && get(item, gp)) {
      this.set('group', get(item, gp));
    }
    this.set('filter', this.get('displayLabel'));
    // https://stackoverflow.com/questions/39624902/new-input-placeholder-behavior-in-safari-10-no-longer-hides-on-change-via-java
    next(() => {
      this.$('.input-search').focus();
      this.$('.input-search').blur();
    })

    if (get(this, 'useLabel')) {
      set(this, 'principalId', get(item, 'label'));
    } else {
      set(this, 'principalId', get(item, 'value'));
    }

    this.send('hide');
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
    if (isBlank(term)) { return set(this, '_principals', get(this, '_ourPrincipals')); }

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

        if ( xhr.body && typeof xhr.body === 'object' && xhr.body.data.length ) {
          // debugger;
          let neu = xhr.body.data;
          // debugger;
          if (neu && neu.length > 0) {
            // get(this, '_principals').pushObjects(neu);
            set(this, '_principals', neu);
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
