import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),

  allowTeams: true,
  checking: false,
  addInput: '',

  actions: {
    add: function() {
      if ( this.get('checking') )
      {
        return;
      }

      this.set('checking', true);
      var input = this.get('addInput').trim();

      this.get('store').find('identity', null, {filter: {all: input}}).then((info) => {
        this.set('addInput','');
        this.send('addObject', info.objectAt(0));
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
    return [];
  }.property(),

  placeholder: function() {
    if ( this.get('access.provider').toLowerCase() === 'githubconfig' )
    {
      return "Add a GitHub user or organization name";
    }
    else
    {
      return "Add a user or group by name";
    }
  }.property('access.provider'),
});
