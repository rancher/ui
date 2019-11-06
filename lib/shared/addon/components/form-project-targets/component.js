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
  globalStore: service(),
  layout,

  classNames:  ['row'],

  headers:     HEADERS,
  projects:    null,
  readOnly:    false,
  fullWidth:   false,
  targets:     null,
  sortBy:      'clusterName',
  searchText:  '',

  appTargets: computed('targets.@each.{projectId}', function() {
    return get(this, 'targets') || [];
  }),

  allProjectsGroupedByCluster: computed('projects.[]', 'targets.@each.projectId', function() {
    return get(this, 'projects').filter((p) => get(p, 'cluster')).map( (p) => {
      const clusterDisplayName =  get(p, 'cluster.displayName');

      const out = {
        name:    get(p, 'displayName'),
        value:   get(p, 'id'),
        cluster: clusterDisplayName
      };

      if (get(this, 'targets').findBy('projectId', p.id)) {
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
