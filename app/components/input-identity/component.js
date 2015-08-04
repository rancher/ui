import Ember from 'ember';

export default Ember.Component.extend({
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

      this.get('store').find('identity', input).then((info) => {
        this.set('addInput','');
        this.send('addObject', info);
      }).catch(() => {
        this.sendAction('onError','Identity not found: ' + input);
      }).finally(() => {
        this.set('checking', false);
      });
    },

    addObject: function(info) {
      this.sendAction('action', Ember.Object.create({
        id: info.get('id'),
        type: info.get('type'),
      }));
    }
  },

  addDisabled: function() {
    return this.get('checking') || this.get('addInput').trim().length === 0;
  }.property('addInput','checking'),

  dropdownChoices: function() {
    return [];
  }.property(),

  placeholder: function() {
    return "Add a GitHub user or organization name";
  }.property(),
});
