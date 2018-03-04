import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import { get, set, computed, observer } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import SearchableSelect from '../searchable-select/component';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { on } from '@ember/object/evented';
import { isAlternate, isMore, isRange } from 'ui/utils/platform';

const DEBOUNCE_MS = 250;
export default SearchableSelect.extend({
  globalStore:    service(),
  errors:         null,
  content:        alias('filteredPrincipals'),
  value:          alias('filter'),
  _principals:    null,
  _ourPrincipals: null,
  useLabel:       null,

  filteredPrincipals: computed('_principals.@each.{id,state}', function() {
    return get(this, '_principals').map(( principal ) =>{
      // console.log({label: get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'), value: get(principal, 'id'), provider: get(principal, 'provider'),});
      return {
        label: get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'),
        value: get(principal, 'id'),
        provider: get(principal, 'provider'),
        type: get(principal, 'principalType')
      };
    }).sortBy('label');
  }),

  init() {
    set(this, '_principals', get(this, 'globalStore').all('principal'));
    get(this, 'globalStore').findAll('principal').then((principals) => {
      set(this, '_ourPrincipals', principals);
    });
    this._super(...arguments);
  },

  externalChanged: on('init', observer('external', function(){
    let principal = get(this, 'external');

    if (principal) {
      if (!get(this, 'globalStore').hasRecordFor(principal.type, principal.id)) {
        get(this, 'globalStore')._add('principal', principal);
      }
      this.set('readOnly', true);
      this.set('optionValuePath', 'label');
      this.setSelect({
        label: get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'),
        value: get(principal, 'id'),
        provider: get(principal, 'provider'),
        type: get(principal, 'principalType')
      });
    }
  })),

  metas: computed(function() {
    return Object.keys(C.KEY).map(k => C.KEY[k]);
  }),
  actions: {
    search(term, e) {
      const kc = e.keyCode;
      var isAlpha = (k) => {
        return !get(this, 'metas').includes(k)
          && !isAlternate(k)
          && !isRange(k)
          && !isMore(k);

      }
      if (isAlpha(kc)) {
        get(this, 'search').perform(term);
      }
    },
    show() {
      if (this.get('showOptions') === true) {
        return;
      }
      const toBottom = $('body').height() - $(this.$()[0]).offset().top - 60;
      this.set('maxHeight', toBottom < get(this,'maxHeight') ? toBottom : get(this,'maxHeight'));
      this.set('showOptions', true);
    },
    hide() {
      set(this, 'filter', get(this, 'displayLabel'))
      this.set('showOptions', false);
      this.set('$activeTarget', null);
    },
  },

  displayLabel: computed('value', 'prompt', 'interContent.[]', function () {
    const value = this.get('value');
    if (!value) {
      return null;
    }

    const vp = this.get('optionValuePath');
    const lp = this.get('optionLabelPath');
    const selectedItem = this.get('interContent').filterBy(vp, value).get('firstObject');

    if (selectedItem) {
      let label = get(selectedItem, lp);
      if (this.get('localizedLabel')) {
        label = this.get('intl').t(label);
      }
      return label;
    }
    return value;
  }),

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

    set(this, 'principal', item);

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
    // task is `restartable`, if the principal starts typing again,
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
