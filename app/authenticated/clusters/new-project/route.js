import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  clusterStore: service('cluster-store'),
  access:       service(),
  catalog:      service(),

  model: function() {
    var userStore = this.get('userStore');
    var clusterStore = this.get('clusterStore');
    return hash({
      all: clusterStore.findAll('project'),
      catalogTemplates: this.get('catalog').fetchTemplates({templateBase: C.EXTERNAL_ID.KIND_INFRA, category: C.EXTERNAL_ID.KIND_ALL}),
    }).then((hash) => {
      var project = clusterStore.createRecord({
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

      return EmberObject.create({
        originalProject: null,
        project: project,
        all: hash.all,
        stacks: [],
      });
    });
  },
});
