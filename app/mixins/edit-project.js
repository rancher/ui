import Ember from 'ember';
import C from 'ui/utils/constants';
import Cattle from 'ui/utils/cattle';
import Util from 'ui/utils/util';

export default Ember.Mixin.create(Cattle.NewOrEditMixin, {
  actions: {
    checkMember: function(obj) {
      var member = Ember.Object.create({
        externalId: obj.get('id'),
        externalIdType: C.PROJECT.FROM_GITHUB[ obj.get('type') ],
        role: (this.get('members.length') === 0 ? C.PROJECT.ROLE_OWNER : C.PROJECT.ROLE_MEMBER)
      });

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

  hasOwner: function() {
    return this.get('members').filterProperty('role', C.PROJECT.ROLE_OWNER).get('length') > 0;
  }.property('members.@each.role'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('hasOwner') && this.get('app.authenticationEnabled') )
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

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('projects');
    this.send('refreshProjects');
    return out;
  },
});
