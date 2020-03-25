import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import C from 'ui/utils/constants';

const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120,
  },
  {
    name:           'scope',
    sort:           ['clusterId', 'projectId'],
    searchField:    ['clusterId',  'projectId'],
    translationKey: 'generic.scope',
    width:          120,
  },
  {
    name:           'name',
    sort:           ['displayName', 'id'],
    searchField:    'displayName',
    translationKey: 'generic.name',
    width:          250,
  },
  {
    name:           'url',
    sort:           ['url', 'displayName'],
    translationKey: 'catalogSettings.more.url.label',
  },
  {
    name:           'branch',
    sort:           ['branch', 'displayName'],
    translationKey: 'catalogSettings.more.branch.label',
    width:          120,
  },
];

export default Component.extend({
  globalStore:  service(),
  settings:     service(),
  layout,
  headers,
  tagName:      null,
  catalogs:     null,
  mode:         'global',
  sortBy:       'name',
  descending:   false,
  paging:       true,
  rightActions: true,

  library: computed('catalogs.@each.{name}', function() {
    return get(this, 'catalogs').findBy('name', C.CATALOG.LIBRARY_KEY);
  }),

  helm3Stable: computed('catalogs.@each.{name}', function() {
    return get(this, 'catalogs').findBy('name', C.CATALOG.HELM_3_LIBRARY_KEY)
  }),

  helmStable: computed('catalogs.@each.{name}', function() {
    return get(this, 'catalogs').findBy('name', C.CATALOG.HELM_STABLE_KEY)
  }),

  helmIncubator: computed('catalogs.@each.{name}', function() {
    return get(this, 'catalogs').findBy('name', C.CATALOG.HELM_INCUBATOR_KEY)
  }),

  alibabaAppHub: computed('catalogs.@each.{name}', function() {
    return get(this, 'catalogs').findBy('name', C.CATALOG.ALIBABA_APP_HUB_KEY)
  }),

  rows: computed('catalogs.@each.{id,name,url}', function() {
    const out = get(this, 'catalogs').slice();

    if ( get(this, 'mode') === 'global' ) {
      if ( !this.library ) {
        out.push(get(this, 'globalStore').createRecord({
          type:   'catalog',
          name:   C.CATALOG.LIBRARY_KEY,
          url:    C.CATALOG.LIBRARY_VALUE,
          branch: C.CATALOG.DEFAULT_BRANCH,
          kind:   'helm',
        }));
      }

      if ( !this.helmStable ) {
        out.push(get(this, 'globalStore').createRecord({
          type:   'catalog',
          name:   C.CATALOG.HELM_STABLE_KEY,
          url:    C.CATALOG.HELM_STABLE_VALUE,
          branch: C.CATALOG.DEFAULT_BRANCH,
          kind:   'helm',
        }));
      }

      if ( !this.helmIncubator ) {
        out.push(get(this, 'globalStore').createRecord({
          type:   'catalog',
          name:   C.CATALOG.HELM_INCUBATOR_KEY,
          url:    C.CATALOG.HELM_INCUBATOR_VALUE,
          branch: C.CATALOG.DEFAULT_BRANCH,
          kind:   'helm',
        }));
      }

      if ( !this.alibabaAppHub ) {
        out.push(get(this, 'globalStore').createRecord({
          type:   'catalog',
          name:   C.CATALOG.ALIBABA_APP_HUB_KEY,
          url:    C.CATALOG.ALIBABA_APP_HUB_VALUE,
          branch: C.CATALOG.DEFAULT_BRANCH,
          kind:   'helm',
        }));
      }

      if ( !this.helm3Stable ) {
        out.push(get(this, 'globalStore').createRecord({
          type:   'catalog',
          name:   C.CATALOG.HELM_3_LIBRARY_KEY,
          url:    C.CATALOG.HELM_3_LIBRARY_VALUE,
          branch: C.CATALOG.DEFAULT_BRANCH,
          kind:   'helm',
        }));
      }
    }

    return out;
  })
});
