import Controller from '@ember/controller';
import { get, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';

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


export default Controller.extend(NewOrEdit, {
  router:          service(),
  globalStore:     service(),
  scope:           service(),

  queryParams:     ['id'],

  id:              null,
  errros:          null,
  saveDisabled:    false,
  allTargets:      null,
  recordType:      'multi',
  headers:         HEADERS,
  config:          alias('model.globaldns'),
  primaryResource: alias('config'),

  actions: {
    modifyProjectIds(event) {
      const select          = event.target;
      const options         = Array.prototype.slice.call(select.options, 0);
      const selectedOptions = [];

      options.filterBy('selected', true).forEach((project) => {
        return selectedOptions.push(project.value);
      });

      set(this, 'primaryResource.projectIds', selectedOptions);
    },

    cancel() {
      set(this, 'id', null);

      this.router.transitionTo('global-admin.global-dns.entries.index');
    }
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

  doneSaving() {
    this.send('cancel');
  },
});
