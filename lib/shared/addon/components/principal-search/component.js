import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import {
  get, set, computed, observer
} from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import SearchableSelect from '../searchable-select/component';
import { alias } from '@ember/object/computed';
import { later } from '@ember/runloop';
import { on } from '@ember/object/evented';
import {
  isAlternate, isMore, isRange
} from 'ui/utils/platform';

const DEBOUNCE_MS = 250;

export default SearchableSelect.extend({
  globalStore:       service(),
  classNames:        'principal-search',
  errors:            null,
  _principals:       null,
  useLabel:          null,
  showDropdownArrow: false,

  clientSideFiltering: false,
  loading:             false,
  focused:             false,
  selectExactOnBlur:   true,
  includeLocal:        true,

  sendAfterLoad: false,

  content:            alias('filteredPrincipals'),
  value:              alias('filter'),
  filteredPrincipals: computed('_principals.@each.{id,state}', function() {
    return ( get(this, '_principals') || [] ).map(( principal ) => {
      // console.log({label: get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'), value: get(principal, 'id'), provider: get(principal, 'provider'),});
      return {
        label:     get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'),
        value:     get(principal, 'id'),
        provider:  get(principal, 'provider'),
        type:      get(principal, 'principalType'),
        principal,
      };
    });
  }),

  externalChanged: on('init', observer('external', function(){
    let principal = get(this, 'external');

    if (principal) {
      // for update TODO
      // if (!get(this, 'globalStore').hasRecordFor(principal.type, principal.id)) {
      //   get(this, 'globalStore')._add('principal', principal);
      // }
      this.set('readOnly', true);
      this.set('optionValuePath', 'label');
      this.setSelect({
        label:    get(principal, 'displayName') || get(principal, 'loginName') || get(principal, 'name'),
        value:    get(principal, 'id'),
        provider: get(principal, 'provider'),
        type:     get(principal, 'principalType')
      });
    }
  })),

  metas: computed(() => {
    return Object.keys(C.KEY).map((k) => C.KEY[k]);
  }),

  displayLabel: computed('value', 'prompt', 'interContent.[]', function() {
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

  showMessage: computed('filtered.[]', 'value', function() {
    if ( !get(this, 'value') ) {
      return false;
    }

    return get(this, 'filtered.length') === 0;
  }),

  init() {
    this._super(...arguments);
    set(this, 'allUsers', get(this, 'globalStore').all('user'));
  },

  didInsertElement() {
    // Explicitly not calling super here to not show until there's content this._super(...arguments);

    this.$('input').on('focus', () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      set(this, 'focused', true);
      const term = get(this, 'value');

      if ( term ) {
        set(this, '_principals', []);
        get(this, 'search').perform(term);
        this.send('show');
      }
    });

    this.$('input').on('blur', () => {
      later(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        set(this, 'focused', false);
        if ( get(this, 'selectExactOnBlur') ) {
          this.scheduleSend();
        }

        this.send('hide');
      }, 250);
    });
  },

  actions: {
    search(term, e) {
      const kc = e.keyCode;

      this.send('show');

      if ( kc === C.KEY.CR || kc === C.KEY.LF ) {
        this.scheduleSend();

        return;
      }

      var isAlpha = (k) => {
        return !get(this, 'metas').includes(k)
          && !isAlternate(k)
          && !isRange(k)
          && !isMore(k);
      }

      if (isAlpha(kc)) {
        set(this, 'principal', null);
        this.sendAction('add');
        get(this, 'search').perform(term);
      }
    },

    show() {
      if (this.get('showOptions') === true) {
        return;
      }
      const toBottom = $('body').height() - $(this.$()[0]).offset().top - 60;  // eslint-disable-line

      this.set('maxHeight', toBottom < get(this, 'maxHeight') ? toBottom : get(this, 'maxHeight'));
      this.set('showOptions', true);
    },

    hide() {
      set(this, 'filter', get(this, 'displayLabel'))
      this.set('showOptions', false);
      this.set('$activeTarget', null);
    },
  },

  scheduleSend() {
    if ( get(this, 'loading') ) {
      set(this, 'sendExactAfterSearch', true);
    } else {
      set(this, 'sendExactAfterSearch', false);
      this.sendSelectExact();
    }
  },

  sendSelectExact() {
    const value = get(this, 'value');
    const match = get(this, 'filteredPrincipals').findBy('label', value);

    let principal = null;

    if ( match ) {
      principal = match.principal;
    } else {
      set(this, 'value', '');
    }

    this.sendAction('selectExact', principal);
    this.send('hide');
  },

  setSelect(item) {
    const gp = this.get('optionGroupPath');
    const vp = this.get('optionValuePath');

    this.set('value', get(item, vp));
    if (gp && get(item, gp)) {
      this.set('group', get(item, gp));
    }

    this.set('filter', this.get('displayLabel'));

    set(this, 'principal', item);
    this.sendAction('add');
    this.send('hide');
  },

  search: task(function * (term) {
    if (isBlank(term)) {
      set(this, '_principals', []);
      set(this, 'loading', false);

      return;
    }

    // Pause here for DEBOUNCE_MS milliseconds. Because this
    // task is `restartable`, if the principal starts typing again,
    // the current search will be canceled at this point and
    // start over from the beginning. This is the
    // ember-concurrency way of debouncing a task.

    set(this, 'loading', true);

    yield timeout(DEBOUNCE_MS);

    let xhr = yield this.get('goSearch').perform(term);

    return xhr;
  }).restartable(),


  goSearch: task(function * (term) {
    const globalStore = get(this, 'globalStore');
    let promise;

    promise = globalStore.rawRequest({
      url:    'principals?action=search',
      method: 'POST',
      data:   { name: term, }
    }).then((xhr) => {
      let neu = [];

      if ( xhr.status !== 204 ) {
        if ( xhr.body && typeof xhr.body === 'object' && xhr.body.data ) {
          neu = xhr.body.data;
        }
      }

      if ( get(this, 'includeLocal') ) {
        let normalizedTerm = term.toLowerCase().trim();
        let foundIds = {};

        neu.forEach((x) => {
          foundIds[x.id] = true;
        })

        let local = get(this, 'allUsers');

        local = local.filter((x) => {
          if ( (x.name || '').toLowerCase().trim().startsWith(normalizedTerm) ||
            (x.username || '').toLowerCase().trim().startsWith(normalizedTerm) ) {
            for ( let i = 0 ; i < x.principalIds.length ; i++ ) {
              if ( foundIds[ x.principalIds[i] ] ) {
                return false;
              }
            }

            return true;
          }

          return false;
        });

        const globalStore = get(this, 'globalStore');

        local = local.map((x) => {
          return globalStore.getById('principal', x.principalIds[0]);
        });
        local = local.filter((x) => !!x);
        neu.addObjects(local);
      }

      set(this, '_principals', neu);

      return xhr;
    }).catch((xhr) => {
      set(this, 'errors', [`${ xhr.status }: ${ xhr.statusText }`]);

      return xhr;
    }).finally(() => {
      set(this, 'loading', false);
      if ( get(this, 'sendExactAfterSearch') ) {
        this.scheduleSend();
      }
    });

    let result = yield promise;

    return result;
  }),
});
