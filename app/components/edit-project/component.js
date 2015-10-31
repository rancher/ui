import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  projects: Ember.inject.service(),
  access: Ember.inject.service(),
  accessEnabled: Ember.computed.alias('access.enabled'),

  model: null,
  editing: null,

  actions: {
    outsideClick() {
    },

    cancel() {
      this.sendAction('dismiss');
    },

    checkMember(member) {
      var existing = this.get('model.projectMembers')
                      .filterBy('externalIdType', member.get('externalIdType'))
                      .filterBy('externalId', member.get('externalId'));

      if ( existing.get('length') )
      {
        this.send('error','Member is already in the list');
        return;
      }

      member.set('role','member');

      this.send('error',null);
      this.get('model.projectMembers').pushObject(member);
    },

    removeMember(item) {
      this.get('model.projectMembers').removeObject(item);
    },
  },

  willInsertElement: function() {
    this._super();
    this.set('model', this.get('originalModel').clone());
    this.set('editing', !!this.get('originalModel.id'));
  },

  roleOptions: function() {
    return this.get('store').getById('schema','projectmember').get('resourceFields.role.options').map((role) => {
      return {
        label: Util.ucFirst(role),
        value: role
      };
    });
  }.property(),


  hasOwner: function() {
    return this.get('model.projectMembers').filterBy('role', C.PROJECT.ROLE_OWNER).get('length') > 0;
  }.property('model.projectMembers.@each.role'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('hasOwner') && this.get('access.enabled') )
    {
      errors.push('You must add at least one owner');
    }

    if ( errors.length )
    {
      this.set('errors', errors);
      return false;
    }

    return true;
  },

  willSave: function() {
    var out = this._super();
    if ( out && !this.get('model.id') )
    {
      this.set('model.members', this.get('model.projectMembers'));
    }
    return out;
  },

  didSave: function() {
    if ( this.get('editing') && this.get('access.enabled') )
    {
      var members = this.get('model.projectMembers').map((member) => {
        return {
          type: 'projectMember',
          externalId: member.externalId,
          externalIdType: member.externalIdType,
          role: member.role
        };
      });

      return this.get('model').doAction('setmembers',{members: members});
    }
  },

  doneSaving: function() {
    var out = this._super();
    this.get('projects').refreshAll();
    this.sendAction('dismiss');
    return out;
  },
});
