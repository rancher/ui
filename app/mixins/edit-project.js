import Ember from 'ember';
import C from 'ui/utils/constants';
import Cattle from 'ui/utils/cattle';
import Util from 'ui/utils/util';
import GithubLookup from 'ui/utils/github-lookup';

export default Ember.Mixin.create(Cattle.NewOrEditMixin, {
  githubLookup: null,
  isAdding: false,
  addMemberInput: null,

  actions: {
    addMember: function(item) {
      if ( item && typeof item === 'object' )
      {
        this.send('maybeAddMember', Ember.Object.create({
          externalId: item.get('id'),
          externalIdType: item.get('type'),
          role: C.PROJECT.ROLE_MEMBER,
        }));
      }
      else if ( item && item.length )
      {
        var lookup = this.get('githubLookup');
        if ( !lookup )
        {
          lookup = GithubLookup.create();
          this.set('githubLookup', lookup);
        }

        this.set('isAdding', true);
        lookup.find('user', item).then((info) => {
          this.set('addMemberInput','');
          this.send('maybeAddMember', Ember.Object.create({
            externalId: info.get('id'),
            externalIdType: (info.get('type') === 'user' ? C.PROJECT.TYPE_USER : C.PROJECT.TYPE_ORG),
            role: C.PROJECT.ROLE_MEMBER,
          }));
        }).catch(() => {
          this.send('error','Unable to find user/org: ' + item);
        }).finally(() => {
          this.set('isAdding', false);
        });
      }
    },

    maybeAddMember: function(member) {
      var existing = this.get('members')
                      .filterProperty('externalIdType', member.get('externalIdType'))
                      .filterProperty('externalId', member.get('externalId'));

      if ( existing.get('length') )
      {
        this.send('error','Member is already in the list');
        return;
      }

      this.send('error',null);
      this.get('members').pushObject(member);
    },

    removeMember: function(item) {
      this.get('members').removeObject(item);
    },
  },

  roleOptions: function() {
    return this.get('store').getById('schema','projectmember').get('resourceFields.role.options').map((role) => {
      return {
        label: Util.ucFirst(role),
        value: role
      };
    });
  }.property(),

  orgChoices: function() {
    var orgs = this.get('session.orgs').slice().sort().map(function(id) {
      return Ember.Object.create({
        id: id,
        type: C.PROJECT.TYPE_ORG,
        teams: []
      });
    });

    this.get('session.teams').forEach(function(team) {
      var org = orgs.filterProperty('id', team.org)[0];
      if ( org )
      {
        org.teams.pushObject(Ember.Object.create({
          id: team.id,
          type: C.PROJECT.TYPE_TEAM,
          name: team.name,
        }));
      }
    });

    return orgs;
  }.property('session.orgs.[]','session.teams.[]'),

  hasOwner: function() {
    return this.get('members').filterProperty('role', C.PROJECT.ROLE_OWNER).get('length') > 0;
  }.property('members.@each.role'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('hasOwner') )
    {
      errors.push('A project must have at least one owner');
    }

    if ( errors.length )
    {
      this.set('errors', errors);
      return false;
    }

    return true;
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('projects');
    this.send('refreshProjectDropdown');
    return out;
  },
});
