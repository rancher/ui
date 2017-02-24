import Ember from 'ember';
import Sortable from 'ui/mixins/sortable-base';
import StickyHeader from 'ui/mixins/sticky-table-header';
import pagedArray from 'ember-cli-pagination/computed/paged-array';
import {isAlternate, isMore, isRange} from 'ui/utils/platform';

const {get,set} = Ember;

export default Ember.Component.extend(Sortable, StickyHeader, {
  prefs: Ember.inject.service(),
  bulkActionHandler: Ember.inject.service(),

  body:              null,
  sortBy:            null,
  descending:        false,
  headers:           null,
  prefix:            false,
  suffix:            false,
  bulkActions:       true,
  search:            true,
  paging:            true,
  bulkActionsList:   null,
  subRows:           false,

  availableActions:  null,
  selectedNodes:     null,
  prevNode:          null,
  searchText:        null,
  page:              1,
  perPage:           Ember.computed.alias('prefs.tablePerPage'),

  showHeader: Ember.computed.or('bulkActions','search','paging'),

  init: function() {
    this._super(...arguments);

    if ( !this.get('paging') ) {
      this.set('perPage', 100000);
    }

    this.set('selectedNodes', []);

    Ember.run.schedule('afterRender', () => {
      let tbody = Ember.$(this.element).find('table tbody');
      let self = this; // need this context in click function and can't use arrow func there

      tbody.on('click', 'tr', function(e) {
        self.rowClick(e);
      });

      tbody.on('mousedown', 'tr', function(e) {
        if ( isRange(e) || e.target.tagName === 'INPUT') {
          e.preventDefault();
        }

      });
    });
  },

  actions: {
    clearSearch() {
      this.set('searchText', '');
    },

    executeBulkAction(name, e) {
      e.preventDefault();
      if (isAlternate(e)) {
        var aa = this.get('availableActions');
        var action = aa.findBy('action', name);
        if (get(action, 'altAction')) {
          this.get('bulkActionHandler')[get(action, 'altAction')](this.get('selectedNodes'));
        } else {
          this.get('bulkActionHandler')[name](this.get('selectedNodes'));
        }
      } else {
        this.get('bulkActionHandler')[name](this.get('selectedNodes'));
      }
    },

    executeAction(action) {
      var node = this.get('selectedNodes')[0];
      node.send(action);
    },
  },

  // -----
  // Table content
  // Flow: body [-> sortableContent] -> arranged -> filtered -> pagedContent
  // -----
  sortableContent: Ember.computed.alias('body'),
  pagedContent: pagedArray('filtered', {pageBinding:  "page", perPageBinding:  "perPage"}),

  // For data-title properties on <td>s
  dt: Ember.computed('headers.@each.{name,displayName}', function() {
    let out = {};
    this.get('headers').forEach((header) => {
      let name = get(header,'name');
      if ( name ) {
        out[name] = get(header, 'displayName') + ': ';
      }
    });

    return out;
  }),

  // Pick a new sort if the current column disappears.
  headersChanged: Ember.observer('headers.@each.name', function() {
    let sortBy = this.get('sortBy');
    let headers = this.get('headers')||[];
    if ( headers && headers.get('length') ) {
      let cur = headers.findBy('name', sortBy);
      if ( !cur ) {
        Ember.run.next(this, function() {
          this.send('changeSort', headers.get('firstObject.name'));
        });
      }
    }
  }),

  searchFields: Ember.computed('headers.@each.{searchField,name}', function() {
    let out = [];

    this.get('headers').forEach((header) => {
      let field = get(header, 'searchField');
      if ( field ) {
        if ( typeof field === 'string' ) {
          out.addObject(field);
        } else if ( Ember.isArray(field) ) {
          out.addObjects(field);
        }
      } else if ( field === false ) {
        // Don't add the name
      } else {
        out.addObject(get(header,'name'));
      }
    });

    return out;
  }),

  filtered: Ember.computed('arranged.[]','searchText', function() {
    let out = this.get('arranged').slice();
    let searchFields = this.get('searchFields');
    let searchText =  (this.get('searchText')||'').trim().toLowerCase();

    if ( searchText.length ) {
      let searchTokens = searchText.split(/\s*[, ]\s*/);

      for ( let j = 0 ; j < searchTokens.length ; j++ ) {
        out = out.filter(matches.bind(null,searchTokens[j]));
      }
    }

    return out;

    function matches(token, item) {
      for ( let i = 0 ; i < searchFields.length ; i++ ) {
        let field = searchFields[i];
        if ( field ) {
          let val = (item.get(field)+'').toLowerCase();
          if ( val && val.indexOf(token) >= 0) {
            return true;
          }
        }
      }
    }
  }),

  pagedContentChanged: Ember.observer('pagedContent.[]', function() {
    // Remove selected items not in the current content
    let content = this.get('pagedContent');
    let nodesToRemove = this.get('selectedNodes').filter((node) => {
      return !content.includes(node);
    });

    this.toggleMulti([], nodesToRemove);
  }),

  indexFrom: Ember.computed('page','perPage', function() {
    var current =  this.get('page');
    var perPage =  this.get('perPage');
    return Math.max(0, 1 + perPage*(current-1));
  }),

  indexTo: Ember.computed('indexFrom','perPage','filtered.length', function() {
    return Math.min(this.get('filtered.length'), this.get('indexFrom') + this.get('perPage') - 1);
  }),

  pageCountContent: Ember.computed('indexFrom','indexTo','pagedContent.totalPages', function() {
    let from = this.get('indexFrom') || 0;
    let to = this.get('indexTo') || 0;
    let count = this.get('filtered.length') || 0;
    let pages = this.get('pagedContent.totalPages') || 0;
    let out = '';

    if ( pages <= 1 ) {
      out = `${count} Item` + (count === 1 ? '' : 's');
    } else {
      out = `${from} - ${to} of ${count}`;
    }

    return out;
  }),

  pageCountChanged: Ember.observer('indexFrom', 'filtered.length', function() {
    // Go to the last page if we end up past the last page
    let from = this.get('indexFrom');
    let last = this.get('filtered.length');
    var perPage = this.get('perPage');

    if ( this.get('page') > 1 && from > last) {
      let page = Math.ceil(last/perPage);
      this.set('page', page);
    }
  }),

  sortKeyChanged: Ember.observer('sortBy', function() {
    this.set('page',1);
  }),

  // ------
  // Clicking
  // ------
  rowClick(e) {
    let tagName = e.target.tagName;
    if ( tagName === 'A'  || $(e.target).data('ember-action') ) {
      return;
    }

    let content = this.get('pagedContent');
    let selection = this.get('selectedNodes');
    let isCheckbox = tagName === 'INPUT' || Ember.$(e.target).hasClass('select-for-action');
    let tgtRow = Ember.$(e.currentTarget);
    while ( tgtRow && !tgtRow.hasClass('main-row') ) {
      tgtRow = tgtRow.prev();
    }

    if ( !tgtRow ) {
      return;
    }

    let nodeId = tgtRow.find('input[type="checkbox"]').attr('nodeid');
    if ( !nodeId ) {
      return;
    }

    let node = content.findBy('id', nodeId);
    if ( !node ) {
      return;
    }

    let isSelected = selection.includes(node);
    let prevNode = this.get('prevNode');
    // PrevNode is only valid if it's in the current content
    if ( !content.includes(prevNode) ) {
      prevNode = null;
    }

    if ( !prevNode ) {
      prevNode = node;
    }

    if ( isMore(e) ) {
      this.toggleSingle(node);
    } else if ( isRange(e) ) {
      let from = content.indexOf(prevNode);
      let to = content.indexOf(node);
      [from, to] = [Math.min(from,to), Math.max(from,to)];
      let toToggle = content.slice(from,to+1);

      if ( isSelected ) {
        this.toggleMulti([], toToggle);
      } else {
        this.toggleMulti(toToggle,[]);
      }
    } else if ( isCheckbox ) {
      this.toggleSingle(node);
    } else {
      this.toggleMulti([node], content);
    }

    this.set('prevNode', node);
  },

  isAll: Ember.computed('selectedNodes.length', 'pagedContent.length', {
    get() {
      return this.get('selectedNodes.length') === this.get('pagedContent.length');
    },

    set(key, value) {
      var content = this.get('pagedContent');
      if ( value ) {
        this.toggleMulti(content, []);
          return true;
      } else {
        this.toggleMulti([], content);
          return false;
      }
    }
  }),

  toggleSingle(node) {
    let selectedNodes = this.get('selectedNodes');

    if ( selectedNodes.includes(node) ) {
      this.toggleMulti([], [node]);
    } else {
      this.toggleMulti([node], []);
    }
  },

  toggleMulti(nodesToAdd, nodesToRemove) {
    let selectedNodes = this.get('selectedNodes');

    if (nodesToRemove.length) {
      // removeObjects doesn't use ArrayProxy-safe looping
      if ( typeof nodesToRemove.toArray === 'function' ) {
        nodesToRemove = nodesToRemove.toArray();
      }
      selectedNodes.removeObjects(nodesToRemove);
      nodesToRemove.forEach((node) => {
        toggle(node, false);
      });
    }

    if (nodesToAdd.length) {
      selectedNodes.addObjects(nodesToAdd);
      nodesToAdd.forEach((node) => {
        toggle(node, true);
      });
    }

    function toggle(node, on) {
      let id = get(node,'id');
      if ( id ) {
        let input = Ember.$(`input[nodeid=${id}]`);
        if ( input && input.length ) {
          Ember.run.next(function() { input[0].checked = on; });
          let tr = Ember.$(input).closest('tr');
          let first = true;
          while ( tr && (first || tr.hasClass('sub-row') ) ) {
            tr.toggleClass('row-selected', on);
            tr = tr.next();
            first = false;
          }
        }
      }
    }
  },

  actionsChanged: Ember.observer('selectedNodes.@each.translatedAvailableActions', function() {
    let data = this.get('selectedNodes');
    var out = null;

    if (data.length > 1) {
      out = this.mergeBulkActions(data);
    } else if (data.length === 1) {
      out = this.mergeSingleActions(data[0]);
    }

    this.set('availableActions', out);
  }),

  mergeBulkActions(nodes) {
    var commonActions =  Ember.$().extend(true, [], this.get('bulkActionsList'));

    // loop over every selectedNode to find available actions
    nodes.forEach((item) => {
      let actions = get(item, 'translatedAvailableActions').filter((action) => {
        return action.enabled && action.bulkable;
      });

      commonActions.forEach((action) => {
        if (!actions.findBy('action', action.action)) {
          set(action, 'disabled', true);
        }
      });

    });

    return commonActions;
  },

  mergeSingleActions(node) {
    var commonActions =  Ember.$().extend(true, [], this.get('bulkActionsList'));
    var localActions =   [];

    // no others selected just push the availabe actions out
    localActions = get(node, 'translatedAvailableActions').filter((action) => {
      return action.enabled;
    });

    // combine both arrays into a unique set
    commonActions = commonActions.concat(localActions).uniqBy('action');

    // find items that need to be disbaled
    commonActions.forEach((action) => {
      if (!localActions.findBy('action', action.action)) {
        set(action, 'disabled', true);
      }
    });

    return commonActions;
  },
});
