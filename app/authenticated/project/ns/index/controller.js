import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';

export const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['sortName', 'id'],
    searchField:    'displayName',
    translationKey: 'namespacesPage.table.name.label',
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['created', 'id'],
    searchField:    false,
    translationKey: 'namespacesPage.table.created.label',
    width:          250,
  },
];

export default Controller.extend({

  scope:             service(),
  router:            service(),
  session:           service(),
  sortBy:            'name',
  headers,
  extraSearchFields: [
    'displayUserLabelStrings',
  ],

  actions: {
    newNs() {
      get(this, 'session').set(C.SESSION.BACK_TO, window.location.href);
      get(this, 'router').transitionTo('authenticated.cluster.projects.new-ns', get(this, 'scope.currentCluster.id'), {
        queryParams: {
          addTo: get(this, 'scope.currentProject.id'),
          from:  'project'
        }
      } );
    },
  },

  allNamespace: computed('model.namespaces.[]', function() {
    let ns = get(this, 'model.namespaces');
    let pId = get(this, 'scope.currentProject.id');

    return ns.filter( (n) => get(n, 'projectId') === pId || isEmpty(get(n, 'projectId')));
  }),

  projectNamespaces: computed('model.namespaces', function() {
    return get(this, 'model.namespaces').filter( (ns) => get(ns, 'projectId') === get(this, 'scope.currentProject.id'));
  }),

  projectlessNamespaces: computed('model.namespaces', function() {
    return get(this, 'model.namespaces').filter( (ns) => isEmpty(get(ns, 'projectId')) );
  }),

});
