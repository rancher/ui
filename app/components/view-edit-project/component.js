import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { sortInsensitiveBy } from 'ui/utils/sort';

export default Ember.Component.extend(NewOrEdit, Sortable, {
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
  sortableContent: Ember.computed.alias('project.projectMembers'),
  sortBy: 'name',
  sorts: {
    name:   ['name', 'externalId'],
    type:   ['externalIdType','externalId'],
    role:   ['role','externalId'],
  },

  stacks: null,

  actions: {
    selectTemplate(id) {
      this.set('project.projectTemplateId', id);
    },

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

  templateChoices: function() {
    var active = this.get('project.projectTemplateId');

    var choices = this.get('projectTemplates').map((tpl) => {
      return {id: tpl.id, name: tpl.name, image: tpl.get('orchestrationIcon')};
    });

    if ( !choices.length ) {
      choices.push({id: null, name: 'None', image: `${this.get('app.baseAssets')}assets/images/logos/provider-orchestration.svg`});
    }

    choices.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return sortInsensitiveBy(choices,'name');
  }.property('project.projectTemplateId','projectTemplates.@each.name'),

  selectedProjectTemplate: function() {
    return this.get('projectTemplates').findBy('id', this.get('project.projectTemplateId'));
  }.property('project.projectTemplateId'),

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

  canEditProject: function() {
    return !this.get('project.id') || !!this.get('project.actionLinks.update');
  }.property('project.actionLinks.update'),

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
    if ( this.get('canEditProject') ) {
      return this._super(...arguments);
    } else {
      return Ember.RSVP.resolve();
    }
  },

  didSave() {
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

    return setMembers.then(() => {
      if ( this.get('project.id') && this.get('network') && !this.get('hasUnsupportedPolicy') )
      {
        return this.get('network').save({
          headers: {
            [C.HEADER.PROJECT_ID]: this.get('project.id'),
          }
        });
      }
    });
  },

  doneSaving() {
    var out = this._super();
    this.get('projects').refreshAll();
    this.sendAction('done');
    return out;
  },
});
