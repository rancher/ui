import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  catalogService: Ember.inject.service(),

  model: function(/*params, transition*/) {
    var userStore = this.get('userStore');
    return Ember.RSVP.hash({
      all: userStore.findAllUnremoved('project'),
      templates: this.get('catalogService').fetchSystemTemplates(),
    }).then((hash) => {
      var project = userStore.createRecord({
        type: 'project',
        name: '',
        description: '',
      });

      if ( this.get('access.enabled') )
      {
        var identity = this.get('session.'+C.SESSION.IDENTITY);
        identity.type = 'identity';
        var me = userStore.createRecord(identity);
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
        all: hash.all,
        templates: hash.templates,
        stacks: [],
      });
    });
  },
});
