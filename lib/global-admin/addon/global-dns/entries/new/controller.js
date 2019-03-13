import Controller from '@ember/controller';
import {
  get, computed, set, setProperties, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { alias } from '@ember/object/computed';
import { all } from 'rsvp';

const HEADERS = [
  {
    translationKey: 'newMultiClusterApp.overrides.table.scope',
    name:           'scope',
    sort:           ['scope'],
  },
  {
    translationKey: 'newMultiClusterApp.overrides.table.target',
    name:           'target',
    sort:           ['target'],
  },
];


export default Controller.extend(ViewNewEdit, {
  router:                    service(),
  globalStore:               service(),
  scope:                     service(),

  queryParams:               ['id'],

  id:                        null,
  errros:                    null,
  saveDisabled:              false,
  allTargets:                null,
  projectsToAddOnUpgrade:    null,
  projectsToRemoveOnUpgrade: null,
  errors:                    null,
  originalModel:             null,
  mode:                      'new',
  recordType:                'multi',

  headers:                   HEADERS,
  config:                    alias('model.globaldns'),
  primaryResource:           alias('config'),

  actions: {
    modifyProjectIds(event) {
      const select                    = event.target;
      const options                   = Array.prototype.slice.call(select.options, 0);
      const selected                  = options.filterBy('selected').map((s) => s.value);
      const current                   = Array.prototype.slice.call(( get(this, 'primaryResource.projectIds') || [] ), 0);
      const projectsToAddOnUpgrade    = [];
      const projectsToRemoveOnUpgrade = [];

      // add
      selected.forEach((projectId) => {
        if (!current.includes(projectId)) {
          projectsToAddOnUpgrade.pushObject(projectId)
        }
      });

      // remove
      current.forEach((projectId) => {
        if (!selected.includes(projectId)) {
          projectsToRemoveOnUpgrade.pushObject(projectId)
        }
      });

      setProperties(this, {
        projectsToAddOnUpgrade,
        projectsToRemoveOnUpgrade,
      });
    },

    cancel() {
      set(this, 'id', null);

      this.transitionToRoute('global-dns.entries.index');
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [] } = this.model.globaldns;

        set(principal, 'accessType', 'owner');

        members.pushObject(this.globalStore.createRecord(principal));

        set(this, 'model.globaldns.members', members);
      }
    },

    removeMember(member) {
      let { members = [] } = this.model.globaldns;

      members.removeObject(member);
    },

  },

  recordTypeChanged: observer('recordType', function() {
    const { recordType, primaryResource = {} } = this;
    const { multiClusterAppId, projectIds }    = primaryResource;
    let { projectsToRemoveOnUpgrade }          = this;

    if (!projectsToRemoveOnUpgrade) {
      projectsToRemoveOnUpgrade = [];
    }

    switch (recordType) {
    case 'multi':
      if (projectIds && projectIds.length) {
        set(primaryResource, 'projectIds', null);
        set(this, 'projectsToRemoveOnUpgrade', projectsToRemoveOnUpgrade.pushObjects(projectIds));
      }
      break;
    case 'project':
      if (multiClusterAppId) {
        set(primaryResource, 'multiClusterAppId', null);
      }
      break;
    default:
      break;
    }
  }),

  providers: computed('model.providers.[]', function() {
    let { providerId } = this.primaryResource;
    let { providers }  = this.model;

    if (providers.length) {
      if (providerId) {
        let match = providers.findBy('id', providerId);

        if (!match) {
          // you don't have access
          providers.pushObject({
            id:       providerId,
            name:     `${ providerId } (no access)`
          });
        }
      }
    } else {
      providers = [];

      if (providerId) {
        providers.pushObject({
          id:       providerId,
          name:     `${ providerId } (no access)`
        });
      }
    }

    return providers.map( (p) => {
      return {
        id:          p.id,
        displayName: `${ p.name }`
      }
    }).sortBy('name');
  }),

  multiClusterApps: computed('model.multiClusterApps.[]', function() {
    let { multiClusterApps }  = this.model;
    let { multiClusterAppId } = this.primaryResource;

    if (multiClusterApps.length) {
      if (multiClusterAppId) {
        let match = multiClusterApps.findBy('id', multiClusterAppId);

        if (!match) {
          // you don't have access
          multiClusterApps.pushObject({
            id:          multiClusterAppId,
            displayName: `${ multiClusterAppId } (no access)`
          });
        }
      }
    } else {
      multiClusterApps = [];

      if (multiClusterAppId) {
        multiClusterApps.pushObject({
          id:          multiClusterAppId,
          displayName: `${ multiClusterAppId } (no access)`
        });
      }
    }

    return multiClusterApps.map( (p) => {
      return {
        id:          p.id,
        displayName: `${ p.displayName }`
      }
    }).sortBy('name');
  }),

  groupedClustersProjects: computed('model.allProjects.[]', function() {
    const allProjects = get(this, 'model.allProjects');
    let out           = [];

    if (get(allProjects, 'length')) {
      out.pushObjects(this.generateClustersFromAllProjects(allProjects));
    }

    if (get(this, 'model.globaldns.projectIds.length')) {
      out.pushObjects(this.generateClustersFromProjectIds(get(this, 'model.globaldns.projectIds')));
    }

    return out.sortBy('displayName');
  }),

  generateClustersFromAllProjects(allProjects) {
    const out = [];

    allProjects.forEach((project) => {
      if (!out.findBy('group', get(project, 'clusterId'))) {
        let cluster = get(project, 'cluster');

        out.pushObject({
          id:          get(cluster, 'id') || get(project, 'clusterId'),
          displayName: get(cluster, 'displayName') || `${ get(project, 'clusterId') } (no access)`,
          group:       get(project, 'clusterId'),
          options:     allProjects.filterBy('clusterId', get(project, 'clusterId')).map((p) => {
            return {
              id:          get(p, 'id'),
              displayName: get(p, 'name') || `${ get(p, 'id') } (no access)`,
            }
          })
        });
      }
    });

    return out;
  },

  generateClustersFromProjectIds(projectIds) {
    const out = [];

    projectIds.forEach((projectId) => {
      let clusterId = projectId.split(':')[0];

      if (!out.findBy('group', clusterId)) {
        out.pushObject({
          id:          clusterId,
          displayName: `${ clusterId } (no access)`,
          group:       clusterId,
          options:     projectIds.filter((projectId) => projectId.split(':')[0] === clusterId).map((projectId) => {
            return {
              id:          projectId,
              displayName: `${ projectId } (no access)`,
            }
          })
        });
      }
    });
  },

  doProjectActions() {
    const { primaryResource }                                   = this;
    const { projectsToAddOnUpgrade, projectsToRemoveOnUpgrade } = this;
    const promises                                              = [];

    if (projectsToAddOnUpgrade && projectsToAddOnUpgrade.length > 0) {
      promises.push(primaryResource.doAction('addProjects', { projectIds: projectsToAddOnUpgrade  }));
    }

    if (projectsToRemoveOnUpgrade && projectsToRemoveOnUpgrade.length > 0) {
      promises.push(primaryResource.doAction('removeProjects', { projectIds: projectsToRemoveOnUpgrade  }));
    }

    if (promises.length > 0) {
      return all(promises);
    } else {
      return true;
    }
  },

  didSave(neu) {
    const { isEdit } = this;

    if (isEdit) {
      return this.doProjectActions();
    } else {
      return neu;
    }
  },

  doneSaving() {
    this.send('cancel');
  },
});
