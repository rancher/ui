import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'name',
  sorts: {
    state:        ['state','name','id'],
    name:         ['name','id'],
    description:  ['description','name','id'],
  },

  projects: Ember.inject.service(),
  needs: ['application'],

  actions: {
    new: function() {
      var store = this.get('store');
      var model = store.createRecord({
        type: 'project',
        name: '',
        description: '',
      });

      if ( this.get('app.authenticationEnabled') )
      {
        var me = store.createRecord({
          type: 'projectMember',
          externalId: this.get('session').get(C.SESSION.USER_ID),
          externalIdType: C.PROJECT.TYPE_USER,
          role: C.PROJECT.ROLE_OWNER
        });
        model.set('projectMembers', [me]);
      }
      else
      {
        model.set('projectMembers',[]);
      }

      this.get('controllers.application').setProperties({
        editProject: true,
        originalModel: model
      });
    },
  },
});
