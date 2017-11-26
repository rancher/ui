import { isArray } from '@ember/array';
import { copy as EmberCopy } from '@ember/object/internals';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getClusterId = function() { return this.get('clusterId'); };

/* Tree item options
  {
    id: 'str' (identifier to allow removal... should be unique)
    localizedLabel: 'i18n key', (or function that returns one)
    label: 'Displayed unlocalized label', (or function that returns string)
    icon: 'icon icon-something',
    condition: function() {
      // return true if this item should be displayed
      // condition can depend on anything page-header/component.js shouldUpdateNavTree() depends on
    }
    target: '_blank', (for url only)
    route: 'target.route.path', // as in link-to
    ctx: ['values', 'asContextToRoute', orFunctionThatReturnsValue, anotherFunction]
    qp: {a: 'hello', b: 'world'],
    moreCurrentWhen: ['additional.routes','for.current-when'],

    submenu: [
      // Another tree item (only one level of submenu supported, no arbitrary depth nesting)
      {...},
      {...}
    ]
  },
*/
const navTree = [
  {
    route: 'authenticated.projects.index',
    localizedLabel: 'projectsPage.header'
  }
];

export function addItem(opt) {
  navTree.pushObject(opt);
}

export function bulkAdd(opts) {
  navTree.addObjects(opts);
}

export function removeId(id) {
  for ( let i = navTree.length-1 ; i >= 0 ; i-- )
  {
    if ( navTree[i].id === id ) {
      navTree.removeAt(i);
    } else if ( navTree[i].submenu && isArray(navTree[i].submenu) ) {
      let sub = navTree[i].submenu;
      for ( var j = sub.length-1 ; j >= 0 ; j-- )
      {
        if ( sub[j].id === id ) {
          sub.removeAt(j);
        }
      }
    }
  }
}

export function get() {
  return EmberCopy(navTree,true);
}

export default {
  get: get,
  removeId: removeId,
  addItem: addItem,
  getProjectId: getProjectId,
  getClusterId: getClusterId,
  bulkAdd: bulkAdd
}
