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

  access: Ember.inject.service(),
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

      if ( this.get('access.enabled') )
      {
        var identity = this.get('session.'+C.SESSION.IDENTITY);
        identity.type = 'identity';
        var me = store.createRecord(identity);
        me.set('role', C.PROJECT.ROLE_OWNER);
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
