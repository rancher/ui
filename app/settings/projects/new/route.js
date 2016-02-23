import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function(/*params, transition*/) {
    var store = this.get('store');
    return store.findAllUnremoved('project').then((all) => {
      var project = store.createRecord({
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
        project.set('projectMembers', [me]);
      }
      else
      {
        project.set('projectMembers',[]);
      }

      return Ember.Object.create({
        originalProject: null,
        project: project,
        all: all,
      });
    });
  },
});
