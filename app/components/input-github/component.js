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

      this.get('github').find('user_or_org', input).then((info) => {
        this.set('addInput','');
        this.send('addObject', info);
      }).catch(() => {
        this.sendAction('onError','User or organization not found: ' + input);
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

  orgChoices: function() {
    var orgs = (this.get('session.orgs')||[]).slice().sort().map(function(id) {
      return Ember.Object.create({
        id: id,
        type: 'org',
        teams: []
      });
    });

    (this.get('session.teams')||[]).forEach(function(team) {
      var org = orgs.filterProperty('id', team.org)[0];
      if ( org )
      {
        org.teams.pushObject(Ember.Object.create({
          id: team.id,
          type: 'team',
          name: team.name,
        }));
      }
    });

    return orgs;
  }.property('session.orgs.[]','session.teams.@each.id'),
});
