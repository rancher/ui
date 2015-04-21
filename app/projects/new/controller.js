import Ember from 'ember';
import C from 'ui/utils/constants';
import Cattle from 'ui/utils/cattle';
import Util from 'ui/utils/util';
import GithubLookup from 'ui/utils/github-lookup';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  githubLookup: null,
  isAdding: false,

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
            externalIdType: (info.get('type') == 'user' ? C.PROJECT.TYPE_USER : C.PROJECT.TYPE_ORG),
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
      var existing = this.get('membersArray')
                      .filterProperty('externalIdType', member.get('externalIdType'))
                      .filterProperty('externalId', member.get('externalId'));

      if ( existing.get('length') )
      {
        this.send('error','Member is already in the list');
        return;
      }

      this.send('error',null);
      this.get('membersArray').pushObject(member);
    },

    removeMember: function(item) {
      this.get('membersArray').removeObject(item);
    },
  },

  membersArray: null,
  initFields: function() {
    var me;
    if ( this.get('app.authenticationEnabled') )
    {
      me = Ember.Object.create({
        externalId: this.get('session').get(C.SESSION.USER_ID),
        externalIdType: C.PROJECT.TYPE_USER,
        role: C.PROJECT.ROLE_OWNER
      });
    }
    else
    {
      me = Ember.Object.create({
        externalId: this.get('session').get(C.SESSION.ACCOUNT_ID),
        externalIdType: C.PROJECT.TYPE_RANCHER,
        role: C.PROJECT.ROLE_OWNER
      });
    }

    this.set('membersArray', [me]);
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

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('projects');
    return out;
  },
});
