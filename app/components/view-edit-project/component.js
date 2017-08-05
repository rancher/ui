import Ember from 'ember';
import C from 'ui/utils/constants';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  projects: Ember.inject.service(),
  access: Ember.inject.service(),
  growl: Ember.inject.service(),
  accessEnabled: Ember.computed.alias('access.enabled'),
  queryParams: ['editing'],

  project: null,
  originalProject: null,
  allProjects: null,
  policyManager: null,
  editing: false,
  tab: 'access',
  primaryResource: Ember.computed.alias('project'),

  sortBy: 'name',
  headers:  [
    {
      name:           'name',
      sort:           ['name', 'externalId'],
      translationKey: 'generic.name',
    },
    {
      name:           'type',
      sort:           ['externalIdType','externalId'],
      translationKey: 'generic.type',
    },
    {
      name:           'role',
      sort:           ['role','externalId'],
      translationKey: 'generic.role',
      width:          '',
    },
    {
      sort:           [],
      translationKey: '',
      width:          '40',
    },
  ],
  stacks: null,

  actions: {
    changeProject(project) {
      this.get('router').transitionTo('settings.projects.detail', project.get('id'));
    },

    cancel() {
      this.sendAction('cancel');
    },

    checkMember(member) {
      var existing = this.get('project.projectMembers')
                      .filterBy('externalIdType', member.get('externalIdType'))
                      .filterBy('externalId', member.get('externalId'));

      if ( existing.get('length') )
      {
        this.send('error','Member is already in the list');
        return;
      }

      member.set('role', (this.get('hasOwner') ? 'member' : 'owner'));

      this.send('error',null);
      this.get('project.projectMembers').pushObject(member);
    },

    removeMember(item) {
      this.get('project.projectMembers').removeObject(item);
    },
  },

  didInsertElement() {
    if ( this.get('showEdit') )
    {
      var elem = this.$('INPUT[type="text"]')[0];
      if ( elem )
      {
        elem.focus();
      }
    }
  },

  projectBase: function() {
    return this.get('app.projectEndpoint').replace(this.get('app.projectToken'), this.get('project.id'));
  }.property('project.id'),

  roleOptions: function() {
    return (this.get('userStore').getById('schema','projectmember').get('resourceFields.role.options')||[]).map((role) => {
      return {
        label: 'model.projectMember.role.'+role,
        value: role
      };
    });
  }.property(),

  hasOwner: function() {
    return this.get('project.projectMembers').filterBy('role', C.PROJECT.ROLE_OWNER).get('length') > 0;
  }.property('project.projectMembers.@each.role'),

  npWithinStack: function() {
    return this.get('network.policy').findBy('within','stack');
  }.property('network.policy.@each.within'),

  npWithinService: function() {
    return this.get('network.policy').findBy('within','service');
  }.property('network.policy.@each.within'),

  npWithinLinked: function() {
    return this.get('network.policy').findBy('within','linked');
  }.property('network.policy.@each.within'),

  missingManager: function() {
    return !this.get('policyManager');
  }.property('policyManager'),

  hasUnsupportedPolicy: function() {
    return this.get('network.policy').filter((x) => { return !!!(x.get('within')); }).length > 0;
  }.property('network.policy.@each.within'),

  validate() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('hasOwner') && this.get('access.enabled') )
    {
      errors.push('You must have at least one owner');
    }

    if ( errors.length )
    {
      this.set('errors', errors);
      return false;
    }

    return true;
  },

  willSave() {
    var out = this._super();
    if ( out && !this.get('project.id') )
    {
      // For create the members go in the request
      this.set('project.members', this.get('project.projectMembers'));
    }

    return out;
  },

  doSave() {
    let setMembers = Ember.RSVP.resolve();
    if ( this.get('editing') )
    {
      if ( this.get('access.enabled') )
      {
        var members = this.get('project.projectMembers').map((member) => {
          return {
            type: 'projectMember',
            externalId: member.externalId,
            externalIdType: member.externalIdType,
            role: member.role
          };
        });

        setMembers = this.get('project').doAction('setmembers',{members: members});
      }
    }

    let sup = this._super;

    return setMembers.then(() => {
      return sup.apply(this,arguments).then(() => {
        if ( this.get('project.id') && this.get('network') && !this.get('hasUnsupportedPolicy') )
        {
          return this.get('network').save({
            headers: {
              [C.HEADER.PROJECT_ID]: this.get('project.id'),
            }
          });
        }
      });
    });
  },

  doneSaving() {
    var out = this._super();
    this.get('projects').refreshAll();
    this.sendAction('done');
    return out;
  },
});
