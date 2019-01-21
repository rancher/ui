import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { reference } from '@rancher/ember-api-store/utils/denormalize';

export default Resource.extend({
  router: service(),
  scope:  service(),

  multiClusterApp: reference('multiClusterAppId', 'multiClusterApp'),

  target: computed('multiClusterAppId', 'projectIds.[]',  function() {
    // returns either a single multiClusterAppId or an array of project target ids
    const out = {
      type: null,
      data: null,
    };

    const { multiClusterAppId, projectIds } = this;

    if (multiClusterAppId && !projectIds) {
      setProperties(out, {
        type: 'single',
        data: multiClusterAppId
      });
    } else if (projectIds && projectIds.length && !multiClusterAppId) {
      setProperties(out, {
        type: 'multi',
        data: projectIds
      });
    }

    return out;
  }),


  linkedProjects: computed('projectIds', function() {
    const allProjects = this.scope.allProjects || [];
    const projectIds = get(this, 'projectIds') || [];

    const myProjects = [];

    allProjects.forEach( (project) => {
      if (projectIds.includes(project.id)) {
        myProjects.pushObject(project);
      }
    });

    return myProjects;
  }),

  canEdit: computed('links.update', function() {
    return !!get(this, 'links.update');
  }),

  canRemove: computed('links.remove', function() {
    return !!get(this, 'links.remove');
  }),

  actions: {
    edit() {
      this.router.transitionTo('global-admin.global-dns.entries.new', { queryParams: { id: this.id } } );
    }
  },

});
