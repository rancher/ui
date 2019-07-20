import Controller from '@ember/controller';
import { get, computed, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { alias } from '@ember/object/computed';
import { all } from 'rsvp';
import { next } from '@ember/runloop';

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
  memberAccessTypes:         ['owner'],

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
    addTarget(targetIn) {
      const isNew                     = this.mode === 'new';
      const current                   = Array.prototype.slice.call(( get(this, 'primaryResource.projectIds') || [] ), 0);
      const projectsToRemoveOnUpgrade = get(this, 'projectsToRemoveOnUpgrade') || [];
      const projectsToAddOnUpgrade    = get(this, 'projectsToAddOnUpgrade') || [];

      if (targetIn && !get(targetIn, 'type')) {
        const projectId = get(targetIn, 'value');

        next(() => {
          if (isNew) {
            current.pushObject(projectId);
            set(this, 'primaryResource.projectIds', current);
          } else {
            let toRemoveMatch = projectsToRemoveOnUpgrade.find( ( removeId ) => removeId === projectId);

            if (toRemoveMatch) {
              // a project was remove then re-added
              set(this, 'projectsToRemoveOnUpgrade', projectsToRemoveOnUpgrade.removeObject(projectId));
            } else {
              projectsToAddOnUpgrade.pushObject(projectId);
              set(this, 'projectsToAddOnUpgrade', projectsToAddOnUpgrade);
            }
          }
        });
      }
    },

    removeTarget(target) {
      const isNew                     = this.mode === 'new';
      const current                   = Array.prototype.slice.call(( get(this, 'primaryResource.projectIds') || [] ), 0);
      const projectsToAddOnUpgrade    = get(this, 'projectsToAddOnUpgrade') || [];
      const projectsToRemoveOnUpgrade = get(this, 'projectsToRemoveOnUpgrade') || [];
      const projectId                 = get(target, 'projectId');

      next(() => {
        if (isNew) {
          current.removeObject(projectId);
          set(this, 'primaryResource.projectIds', current);
        } else {
          let targetToAddMatch = projectsToAddOnUpgrade.find( ( addId ) => addId === projectId);

          if (targetToAddMatch) {
            set(this, 'projectsToAddOnUpgrade', projectsToAddOnUpgrade.removeObject(projectId));
          } else {
            projectsToRemoveOnUpgrade.pushObject(projectId);
            set(this, 'projectsToRemoveOnUpgrade', projectsToRemoveOnUpgrade);
          }
        }
      });
    },

    cancel() {
      set(this, 'id', null);

      this.transitionToRoute('global-dns.entries.index');
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [] } = this.model.globaldns;

        if (!members) {
          members = [];
        }

        set(principal, 'accessType', 'owner');

        members.pushObject(this.globalStore.createRecord(principal));

        set(this, 'model.globaldns.members', members);
      }
    },

    removeAuthorizedPrincipal(member) {
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

  combinedProjectIds: computed('primaryResource.projectIds', 'projectsToRemoveOnUpgrade.[]', 'projectsToAddOnUpgrade.[]', function() {
    const projectsToRemoveOnUpgrade = get(this, 'projectsToRemoveOnUpgrade') || [];
    const projectsToAddOnUpgrade    = get(this, 'projectsToAddOnUpgrade') || [];
    const projectIds                = get(this, 'primaryResource.projectIds') || [];

    return [...projectsToAddOnUpgrade, ...projectIds].filter((projectId) => !projectsToRemoveOnUpgrade.includes(projectId));
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
            name:     providerId
          });
        }
      }
    } else {
      providers = [];

      if (providerId) {
        providers.pushObject({
          id:       providerId,
          name:     providerId
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

  projectTargets: computed('combinedProjectIds.[]', 'projectsToRemoveOnUpgrade.[]', function() {
    const allProjects = get(this, 'model.allProjects');
    const projectIds  = get(this, 'combinedProjectIds');
    const out         = [];

    projectIds.forEach((projectId) => {
      let projectMatch = allProjects.findBy('id', projectId);

      if (projectMatch) {
        out.pushObject({
          projectId,
          project:     projectMatch,
          projectName: get(projectMatch, 'displayName'),
          clusterName: get(projectMatch, 'cluster.displayName'),
          clusterId:   projectId.split(':')[0],
        });
      } else {
        out.pushObject({
          projectId,
          clusterId:   projectId.split(':')[0],
        });
      }
    })

    return out;
  }),

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
