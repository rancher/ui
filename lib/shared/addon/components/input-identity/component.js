import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { get, set, setProperties, computed } from '@ember/object';

export default Component.extend({
  access:            service(),
  intl:              service(),
  globalStore:       service(),
  layout,
  allowTeams:        true,
  checking:          false,
  addInput:          '',
  allPrincipals:     null,
  selected:          null,
  selectExactOnBlur: true,
  includeLocal:      true,
  searchOnlyGroups:  false,

  init() {
    this._super(...arguments);

    set(this, 'allPrincipals', get(this, 'globalStore').all('principal'));

    if (this.initialPrincipal) {
      setProperties(this, {
        selected: this.initialPrincipal,
        filter:   this.initialPrincipal.name,
      });
    }
  },

  actions: {
    add() {
      if ( get(this, 'checking') ) {
        return;
      }

      const addInput = get(this, 'addInput');

      if ( !addInput ) {
        set(this, 'selected', null);

        if (this.action) {
          this.action(null);
        }

        // console.log('@add:Cleared principal');

        return;
      }

      set(this, 'checking', true);

      var input = get(addInput, 'value').trim();
      let match = get(this, 'allPrincipals').findBy('id', input);

      if (match) {
        this.send('selectExact', match);

        set(this, 'checking', false);
      } else {
        get(this, 'globalStore').rawRequest({
          url:    `principals/${ encodeURIComponent(input) }`,
          method: 'GET',
        }).then((xhr) => {
          if ( xhr.status === 204 ) {
            return;
          }

          if ( xhr.body && typeof xhr.body === 'object' ) {
            let principal = get(xhr, 'body');

            this.send('selectExact', principal);
          }
        }).catch((xhr) => {
          if (this.onError) {
            this.onError(`Principal not found: ${  xhr.statusText }`);
          }
        })
          .finally(() => {
            set(this, 'checking', false);
          });
      }
    },

    addObject(info) {
      if (this.action) {
        this.action(info);
      }

      setProperties(this, {
        selected: info,
        filter:   get(info, 'name')
      });
      // console.log('@addObject:Set principal:', JSON.stringify(info));
    },

    selectExact(match) {
      const cur = get(this, 'selected');

      if ( !cur ) {
        if (this.action) {
          this.action(match);
        }

        setProperties(this, {
          addInput: '',
          selected: match
        });
        // console.log('@selectExact:Set principal:', JSON.stringify(match));
      }
    },
  },

  showDropdown: computed('access.provider', function() {
    return get(this, 'access.provider') !== 'localauthconfig';
  }),

  addDisabled: computed('addInput', 'checking', function() {
    let input = get(this, 'addInput.value') || '';

    return get(this, 'checking') || input.trim().length === 0;
  }),

  dropdownChoices: computed('allPrincipals.@each.{logicalType,id}', 'allowTeams', function() {
    var allowTeams = get(this, 'allowTeams');

    return get(this, 'allPrincipals').filter((principal) => {
      var type = get(principal, 'parsedExternalType');
      var logicalType = get(principal, 'logicalType');

      // Don't show other junk that was added to the store after load
      if ( !get(principal, '_mine') ) {
        return false;
      }

      // Don't show people
      if ( logicalType === C.PROJECT.PERSON ) {
        return false;
      }

      // Don't show teams if disabled
      if ( !allowTeams && type === C.PROJECT.TYPE_GITHUB_TEAM ) {
        return false;
      }

      return true;
    }).sortBy('logicalTypeSort', 'profileUrl', 'name');
  }),

  dropdownLabel: computed('access.provider', 'intl.locale', function() {
    let out = '';
    let intl = get(this, 'intl');

    if ( get(this, 'access.provider') === 'githubconfig' ) {
      out = intl.t('inputIdentity.dropdownLabel.teams');
    } else {
      out = intl.t('inputIdentity.dropdownLabel.groups');
    }

    return out;
  }),
});
