import Controller from '@ember/controller';
import { get, computed, set, setProperties } from '@ember/object';
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
  recordType:                'multi',

  headers:                   HEADERS,
  config:                    alias('model.globaldns'),
  primaryResource:           alias('config'),

  actions: {
    modifyProjectIds(event) {
      const select          = event.target;
      const options         = Array.prototype.slice.call(select.options, 0);
      const selectedOptions = [];
      let { projectsToAddOnUpgrade, projectsToRemoveOnUpgrade } = this;
      let { isEdit } = this;
      let current = get(this, 'primaryResource.projectIds') || [];

      options.filter((project) => {
        if (project.selected) {
          if (isEdit) {
            if (projectsToAddOnUpgrade && !projectsToAddOnUpgrade.includes(project.value)) {
              projectsToAddOnUpgrade.push(project.value);
            } else {
              projectsToAddOnUpgrade = [project.value];
            }
          }

          selectedOptions.push(project.value);
        } else {
          if (isEdit && current.length >= 1) {
            let match = current.find((p) => p === project.value);

            if (match) {
              if (projectsToRemoveOnUpgrade) {
                if (!projectsToRemoveOnUpgrade.includes(match)) {
                  projectsToRemoveOnUpgrade.push(match);
                }
              } else {
                projectsToRemoveOnUpgrade = [match];
              }
            }
          }
        }
      })

      setProperties(this, {
        'primaryResource.projectIds': selectedOptions,
        projectsToAddOnUpgrade,
        projectsToRemoveOnUpgrade,
      })
    },

    cancel() {
      set(this, 'id', null);

      this.router.transitionTo('global-admin.global-dns.entries.index');
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [] } = this.model.globaldns;
        const { principalType, id } = principal;

        const nue = {
          type:        'member',
          accessType:  'owner',
        };

        if (principalType === 'group') {
          set(nue, 'groupPrincipalId', id);
        } else if (principalType === 'user') {
          set(nue, 'userPrincipalId', id);
        }


        members.pushObject(this.globalStore.createRecord(nue));

        set(this, 'model.globaldns.members', members);
      }
    },

    removeMember(member) {
      let { members = [] } = this.model.globaldns;

      members.removeObject(member);
    },

  },

  providers: computed('model.providers.[]', function() {
    return ( get(this, 'model.providers') || [] ).map( (p) => {
      return {
        id:          p.id,
        displayName: `${ p.name }`
      }
    });
  }),

  groupedClustersProjects: computed('model.allClusters.[]', function() {
    const clusters = get(this, 'model.allClusters');

    return clusters.map( (cluster) => {
      return {
        id:          cluster.id,
        displayName: cluster.displayName,
        group:       cluster.displayName,
        options:     cluster.projects.map((p) => {
          return {
            id:          p.id,
            displayName: p.name,
          }
        })
      }
    });
  }),

  willSave() {
    set(this, 'errors', null);
    const ok          = this.validate();
    const { isEdit } = this;

    if (!ok) {
      // Validation failed
      return false;
    }

    if (isEdit) {
      return this.doProjectActions();
    } else {
      return true;
    }
  },

  doProjectActions() {
    const { primaryResource } = this;
    const { projectsToAddOnUpgrade, projectsToRemoveOnUpgrade } = this;
    const promises = [];

    if (projectsToAddOnUpgrade) {
      promises.push(primaryResource.doAction('addProjects', { projectIds: projectsToAddOnUpgrade  }));
    }

    if (projectsToRemoveOnUpgrade) {
      promises.push(primaryResource.doAction('removeProjects', { projectIds: projectsToRemoveOnUpgrade  }));
    }

    if (promises.length > 0) {
      return all(promises)
        .then(() => {
          return true;
        })
        .catch((/* handled by growl error */) => {
          return false;
        });
    } else {
      return true;
    }
  },


  doneSaving() {
    this.send('cancel');
  },
});
