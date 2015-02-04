import Ember from 'ember';
import C from 'ui/utils/constants';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  actions: {
    selectOwner: function(type,login) {
      this.beginPropertyChanges();
      this.set('externalId', login);
      this.set('externalIdType', type);
      this.endPropertyChanges();
    },
  },

  typeUser: C.PROJECT_TYPE_USER,
  typeTeam: C.PROJECT_TYPE_TEAM,
  typeOrg: C.PROJECT_TYPE_ORG,

  ownerChoices: function() {
    var out = [];
    var externalIdType = this.get('externalIdType');
    var externalId = this.get('externalId');

    out.pushObject({
      type: C.PROJECT_TYPE_USER,
      githubType: 'user',
      login: this.get('session.user'),
      active: (externalIdType === C.PROJECT_TYPE_USER && externalId === this.get('session.user')),
    });

    /* @TODO fix team uniqueness, https://github.com/rancherio/cattle/issues/215
    out.pushObjects(this.get('session.teams').map(function(team) {
      return {
        type: C.PROJECT_TYPE_TEAM,
        githubType: 'team',
        login: team.name,
        active: (externalIdType === C.PROJECT_TYPE_TEAM && externalId === team.name),
      };
    }));
    */

    out.pushObjects(this.get('session.orgs').map(function(org) {
      return {
        type: C.PROJECT_TYPE_ORG,
        githubType: 'org',
        login: org,
        active: (externalIdType === C.PROJECT_TYPE_ORG && externalId === org),
      };
    }));

    return out;
  }.property('session.user','session.teams.@each.name','session.orgs.[]','externalId','externalIdType'),

  doneSaving: function() {
    var out = this._super();
    this.send('goToPrevious');
    return out;
  },
});
