import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,
  access: service(),
  intl: service(),
  allowTeams: true,
  checking: false,
  addInput: '',
  allIdentities: null,
  showDropdown: function() {
    return this.get('access.provider') !== 'localauthconfig';
  }.property('access.provider'),

  init: function() {
    this.set('allIdentities', this.get('globalStore').all('identity'));
    this.get('globalStore').findAll('identity');
    this._super();
  },

  actions: {
    add: function() {
      if ( this.get('checking') )
      {
        return;
      }

      this.set('checking', true);
      var input = this.get('addInput').trim();

      this.get('globalStore').find('identity', null, {filter: {name: input}}).then((info) => {
        var obj = info.objectAt(0);
        if (obj)
        {
          this.set('addInput','');
          this.send('addObject', obj);
        }
        else
        {
          this.sendAction('onError','Identity not found: ' + input);
        }
      }).catch(() => {
        this.sendAction('onError','Identity not found: ' + input);
      }).finally(() => {
        this.set('checking', false);
      });
    },

    addObject: function(info) {
      this.sendAction('action', info);
    }
  },

  addDisabled: function() {
    return this.get('checking') || this.get('addInput').trim().length === 0;
  }.property('addInput','checking'),

  dropdownChoices: function() {
    var allowTeams = this.get('allowTeams');
    return this.get('allIdentities').filter((identity) => {
      var type = identity.get('externalIdType');
      var logicalType = identity.get('logicalType');

      // Don't show people
      if ( logicalType === C.PROJECT.PERSON )
      {
        return false;
      }

      // Don't show teams if disabled
      if ( !allowTeams && type === C.PROJECT.TYPE_GITHUB_TEAM )
      {
        return false;
      }

      return true;
    }).sortBy('logicalTypeSort','profileUrl','name');
  }.property('allIdentities.@each.{logicalType,externalIdType}','allowTeams'),

  dropdownLabel: function() {
    let out = '';
    let intl = this.get('intl');
    if ( this.get('access.provider') === 'githubconfig' )
    {
      out = intl.findTranslationByKey('inputIdentity.dropdownLabel.teams');
    }
    else
    {
      out = intl.findTranslationByKey('inputIdentity.dropdownLabel.groups');
    }
    return intl.formatMessage(out);
  }.property('access.provider', 'intl.locale'),
});
