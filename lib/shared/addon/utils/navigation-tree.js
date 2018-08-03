import { isArray } from '@ember/array';
import { copy as EmberCopy } from 'ember-copy';



// Useful context/condition shortcuts
export const getProjectId = function() {
  return this.get('projectId');
};
export const getClusterId = function() {
  return this.get('clusterId');
};

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
];

export function addItem(opt) {
  navTree.pushObject(opt);
  syncCurrentWhen();
}

export function bulkAdd(opts) {
  navTree.pushObjects(opts);
  syncCurrentWhen();
}

export function removeId(id) {
  // These go backwards so that entries aren't skipped if multiple are deleted
  for ( let i = navTree.length - 1 ; i >= 0 ; i-- ) {
    if ( navTree[i].id === id ) {
      navTree.removeAt(i);
    } else if ( navTree[i].submenu && isArray(navTree[i].submenu) ) {
      let sub = navTree[i].submenu;

      for ( var j = sub.length - 1 ; j >= 0 ; j-- ) {
        if ( sub[j].id === id ) {
          sub.removeAt(j);
        }
      }
    }
  }

  syncCurrentWhen();
}

export function get() {
  // return JSON.parse(JSON.stringify(navTree));
  return EmberCopy(navTree, true);
}

function syncCurrentWhen() {
  for ( let i = 0 ; i < navTree.length ; i++ ) {
    let when = (navTree[i].moreCurrentWhen || []).slice();

    let sub = navTree[i].submenu;

    if ( sub ) {
      when.addObjects(sub.map((x) => x.route));
      when = when.filter((x) => !!x && x.length);
    }

    navTree[i].currentWhen = when;
  }
}

export default {
  get,
  removeId,
  addItem,
  getProjectId,
  getClusterId,
  bulkAdd
}
