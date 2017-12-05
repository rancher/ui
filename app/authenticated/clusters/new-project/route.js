import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  access:      service(),
  catalog:     service(),

  model: function() {
    var store = this.get('globalStore');

    return hash({
      all: store.findAll('project'),
      catalogTemplates: this.get('catalog').fetchTemplates({templateBase: C.EXTERNAL_ID.KIND_INFRA, category: C.EXTERNAL_ID.KIND_ALL}),
    }).then((hash) => {
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

      return EmberObject.create({
        originalProject: null,
        project: project,
        all: hash.all,
        stacks: [],
      });
    });
  },
});
