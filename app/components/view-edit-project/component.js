import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, Sortable, {
  projects: Ember.inject.service(),
  access: Ember.inject.service(),
  accessEnabled: Ember.computed.alias('access.enabled'),

  model: null,
  project: Ember.computed.alias('model.project'),
  originalProject: Ember.computed.alias('model.originalProject'),
  primaryResource: Ember.computed.alias('model.project'),

  queryParams: ['editing'],
  editing: false,

  sortableContent: Ember.computed.alias('project.projectMembers'),
  sortBy: 'name',
  sorts: {
    name:   ['externalId'],
    type:   ['externalIdType','externalId'],
    role:   ['role','externalId'],
  },

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

    selectOrchestration(name) {
      this.get('project').setProperties({
        kubernetes: (name === 'kubernetes'),
        swarm: (name === 'swarm'),
        mesos: (name === 'mesos'),
      });
      this.set('activeOrchestration', name);
    },
  },

  activeOrchestration: null,
  init() {
    this._super(...arguments);
    var orch = 'rancher';
    if ( this.get('project.kubernetes') )
    {
      orch = 'kubernetes';
    }
    else if ( this.get('project.swarm') )
    {
      orch = 'swarm';
    }
    else if ( this.get('project.mesos') )
    {
      orch = 'mesos';
    }

    this.set('activeOrchestration', orch);
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

  orchestrationChoices: function() {
    var active = this.get('activeOrchestration');
    var fields = this.get('userStore').getById('schema','project').get('resourceFields');

    var drivers = [
      {name: 'rancher',     label: 'Corral',      css: 'rancher'}
    ];

    if ( fields.kubernetes ) {
      drivers.push({name: 'kubernetes',  label: 'Kubernetes',  css: 'kubernetes'});
    }

    if ( fields.mesos ) {
      drivers.push({name: 'mesos',       label: 'Mesos',       css: 'mesos'});
    }

    if ( fields.swarm ) {
      drivers.push({name: 'swarm',       label: 'Swarm',       css: 'swarm'});
    }

    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return drivers;
  }.property('activeOrchestration'),

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

  didSave: function() {
    if ( this.get('editing') && this.get('access.enabled') )
    {
      var members = this.get('project.projectMembers').map((member) => {
        return {
          type: 'projectMember',
          externalId: member.externalId,
          externalIdType: member.externalIdType,
          role: member.role
        };
      });

      return this.get('project').doAction('setmembers',{members: members});
    }
  },

  doneSaving: function() {
    var out = this._super();
    this.get('projects').refreshAll();
    this.sendAction('done');
    return out;
  },
});
