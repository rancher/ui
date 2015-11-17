import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  access: Ember.inject.service(),

  allowTeams: true,
  checking: false,
  addInput: '',
  allIdentities: null,
  showDropdown: function() {
    return this.get('access.provider') !== 'localauthconfig';
  }.property('access.provider'),

  // @TODO bad...
  dropdownLoaded: Ember.computed.alias('store._foundAll.identity'),

  init: function() {
    this.set('allIdentities', this.get('store').all('identity'));
    this.get('store').findAll('identity');
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

      this.get('store').find('identity', null, {filter: {name: input}}).then((info) => {
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

  placeholder: function() {
    if ( this.get('access.provider') === 'githubconfig' )
    {
      return "Add a GitHub user or organization name";
    }
    else
    {
      return "Add a user or group by name";
    }
  }.property('access.provider'),

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
    if ( this.get('access.provider') === 'githubconfig' )
    {
      return "Your Teams and Organizations";
    }
    else
    {
      return "Your Groups";
    }
  }.property('access.provider'),
});
