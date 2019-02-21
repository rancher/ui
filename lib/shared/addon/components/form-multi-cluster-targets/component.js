import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

const HEADERS = [
  {
    translationKey: 'newMultiClusterApp.targets.cluster',
    name:           'clusterName',
    sort:           ['clusterName'],
  },
  {
    translationKey: 'newMultiClusterApp.targets.project',
    name:           'projectName',
    sort:           ['projectName'],
  },
]

export default Component.extend({
  globalStore:     service(),
  layout,

  classNames:      ['row'],

  headers:         HEADERS,
  multiClusterApp: null,
  projects:        null,
  readOnly:        null,
  isClone:         false,
  isEditing:       false,
  sortBy:            'clusterName',
  searchText:        '',

  appTargets: computed('multiClusterApp.targets.@each.{projectId}', function() {
    return get(this, 'multiClusterApp.targets') || [];
  }),

  allProjectsGroupedByCluster: computed('projects.[]', 'multiClusterApp.targets.@each.projectId', function() {
    return get(this, 'projects').map( (p) => {
      const clusterDisplayNameOrNa =  get(p, 'cluster.displayName') || this.intl.t('generic.na');

      const out = {
        name:    get(p, 'name'),
        value:   get(p, 'id'),
        cluster: clusterDisplayNameOrNa
      };

      if (get(this, 'multiClusterApp.targets').findBy('projectId', p.id)) {
        set(out, 'disabled', true);
      } else {
        if (!out.disabled) {
          set(out, 'disabled', false);
        }
      }

      return out;
    }).filter((c) => !c.disabled); // searchable-select doesn't use the disable flag
  }),


});
