import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { get, set, computed } from '@ember/object';

export default Component.extend({
  layout,
  access: service(),
  intl: service(),
  globalStore: service(),
  allowTeams: true,
  checking: false,
  addInput: '',
  allPrincipals: null,
  selected: null,
  selectExactOnBlur: true,


  showDropdown: computed('access.provider', function() {
    return get(this, 'access.provider') !== 'localauthconfig';
  }),

  init: function() {
    this._super(...arguments);
    set(this, 'allPrincipals', get(this, 'globalStore').all('principal'));
  },

  actions: {
    add: function() {
      if ( get(this, 'checking') )
      {
        return;
      }

      set(this, 'checking', true);
      var input = get(this, 'addInput.value').trim();
      let match = get(this, 'allPrincipals').findBy('id', input);
      var setPrincipal = (principal) => {
        set(this, 'addInput', '');
        set(this, 'selected', principal);
        this.sendAction('action', principal);
      }

      if (match) {
        setPrincipal(match);
        set(this, 'checking', false);
      } else {
        get(this, 'globalStore').rawRequest({
          url: `principals/${encodeURIComponent(input)}`,
          method: 'GET',
        }).then((xhr) => {
          if ( xhr.status === 204 ) {
            return;
          }

          if ( xhr.body && typeof xhr.body === 'object' ) {
            let principal = get(xhr, 'body');
            setPrincipal(principal);
          }
        }).catch((xhr) => {
          this.sendAction('onError','Principal not found: ' + xhr.statusText);
        }).finally(() => {
          set(this, 'checking', false);
        });
      }
    },

    addObject: function(info) {
      this.sendAction('action', info);
      set(this, 'selected', info);
      this.set('filter', get(info,'name'));
    },

    selectExact(match) {
      //const cur = get(this, 'selected');
      if ( match ) {
        this.sendAction('action', match);
        set(this, 'selected', match);
      } else {
        this.sendAction('action', null);
        set(this, 'selected', null);
      }
    },
  },

  addDisabled: computed('addInput','checking', function() {
    let input = get(this, 'addInput.value')||'';

    return get(this, 'checking') || input.trim().length === 0;
  }),

  dropdownChoices: computed('allPrincipals.@each.{logicalType,id}','allowTeams', function() {
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
    }).sortBy('logicalTypeSort','profileUrl','name');
  }),

  dropdownLabel: computed('access.provider', 'intl.locale', function() {
    let out = '';
    let intl = get(this, 'intl');
    if ( get(this, 'access.provider') === 'githubconfig' )
    {
      out = intl.findTranslationByKey('inputIdentity.dropdownLabel.teams');
    }
    else
    {
      out = intl.findTranslationByKey('inputIdentity.dropdownLabel.groups');
    }
    return intl.formatMessage(out);
  }),
});
