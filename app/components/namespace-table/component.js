import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { matches } from 'shared/components/sortable-table/component';

const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['displayName'],
    searchField:    ['displayName', 'name'],
    translationKey: 'projectsPage.ns.label',
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['createdTs'],
    searchField:    false,
    translationKey: 'projectsPage.created.label',
    width:          250,
  },
];

export default Component.extend({
  scope: service(),

  layout,
  headers,
  tagName:           '',
  sortBy:            'name',
  searchText:        '',
  subRows:           true,
  suffix:            true,
  paging:            true,
  extraSearchFields: [
    'displayUserLabelStrings',
    'project.displayName',
  ],

  projectsWithoutNamespace: computed('projectsWithoutNamespaces.[]', 'searchText', function() {
    let searchText     = (get(this, 'searchText') || '').trim().toLowerCase();
    let out            = get(this, 'projectsWithoutNamespaces').slice();
    let searchFields   = ['displayName'];

    if ( searchText.length ) {
      let searchTokens = searchText.split(/\s*[, ]\s*/);

      for ( let i = out.length - 1 ; i >= 0 ; i-- ) {
        let hits      = 0;
        let row       = out[i];
        let mainFound = true;

        for ( let j = 0 ; j < searchTokens.length ; j++ ) {
          let expect = true;
          let token  = searchTokens[j];

          if ( token.substr(0, 1) === '!' ) {
            expect = false;
            token  = token.substr(1);
          }

          if ( token && matches(searchFields, token, row) !== expect ) {
            mainFound = false;

            break;
          }
        }

        if ( !mainFound && hits === 0 ) {
          out.removeAt(i);
        }
      }
    }

    return out
  }),
});
