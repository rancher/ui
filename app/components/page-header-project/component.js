import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { get, set, computed, setProperties } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import textWidth from 'shared/utils/text-width';
import { next } from '@ember/runloop';
import { escapeRegex, escapeHtml } from 'shared/utils/util';
import $ from 'jquery';
import { isEmpty } from '@ember/utils';

const ITEM_HEIGHT      = 50;
const BUFFER_HEIGHT    = 150;
const BUFFER_WIDTH     = 150;
const MIN_COLUMN_WIDTH = 200;
const FONT             = '13.5px "Prompt", "Helvetica Neue Light", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const MOUSE_HISTORY    = 5;
const MOUSE_DELAY      = 250;
const SLOP             = 50; // Extend the ends of the target triangle out by this many px

export default Component.extend(ThrottledResize, {
  access:              service(),
  scope:               service(),
  globalStore:         service(),
  router:              service(),

  layout,
  pageScope:           null,

  tagName:             'LI',
  classNames:          ['dropdown', 'nav-item', 'nav-cluster'],
  classNameBindings:   ['hide'],

  searchInput:         '',
  open:                false,

  columnStyle:         '',
  menuStyle:           '',
  mousePoints:         null,
  clusterEntry:        null,
  activeClusterEntry:  null,
  hoverEntry:          null,
  hoverDelayTimer:     null,
  delayPoint:          null,
  leaveDelayTimer:     null,

  boundClickMenu:      null,
  boundClickItem:      null,
  boundEnterCluster:   null,
  dropdownApi:         null,

  project:             alias('scope.pendingProject'),
  cluster:             alias('scope.pendingCluster'),
  numClusters:         alias('byCluster.length'),

  init() {
    this._super(...arguments);
    setProperties(this, {
      mousePoints:         [],
      boundMouseMove:      this.mouseMoved.bind(this),
      boundClickMenu:      this.clickMenu.bind(this),
      boundClickItem:      this.clickItem.bind(this),
      boundEnterCluster:   this.enterCluster.bind(this),
      boundEnterScrollers: this.enterScrollers.bind(this),
      boundLeaveScrollers: this.leaveScrollers.bind(this),
    });
  },

  actions: {
    onOpen(dropdown) {
      set(this, 'open', true);
      this.onResize();

      if (dropdown) {
        set(this, 'dropdownApi', dropdown);
      }

      next(() => {
        if (!this.isTransitioning()) {
          const menu = $('.project-menu');
          const clusters = $('.clusters');

          $(document).on('mousemove', this.boundMouseMove);

          menu.on('click', this.boundClickMenu);
          menu.on('click', 'LI', this.boundClickItem);
          menu.on('touchend', '.projects LI', this.boundClickItem);

          clusters.on('focus', 'LI', this.boundEnterCluster);
          clusters.on('mouseenter', 'LI', this.boundEnterCluster);

          $('.clusters, .projects').on('mouseenter', this.boundEnterScrollers);
          $('.clusters, .projects').on('mouseleave', this.boundLeaveScrollers);

          $('.search INPUT')[0].focus();

          $('.clusters UL')[0].scrollTop = 0;
          $('.projects UL')[0].scrollTop = 0;

          const currentClusterId = get(this, 'cluster.id');
          const currentProjectId = get(this, 'project.id');

          if ( currentClusterId ) {
            const li = $(`.clusters LI[data-cluster-id="${ currentClusterId }"]`)[0];
            const entry = get(this, 'byCluster').findBy('clusterId', currentClusterId);

            ensureVisible(li);

            setProperties(this, {
              clusterEntry:       entry,
              activeClusterEntry: entry,
            });
          }

          if ( currentProjectId ) {
            next(() => {
              const li = $(`.projects LI[data-project-id="${ currentProjectId }"]`)[0];

              ensureVisible(li);
            });
          }
        }
      });
    },

    onClose() {
      setProperties(this, {
        activeClusterEntry: null,
        clusterEntry:       null,
        dropdownApi:        null,
        hoverEntry:         null,
        open:               false,
        searchInput:        '',
      });

      $(document).off('mousemove', this.boundMouseMove);
      $('.project-menu').off('click', this.boundClickMenu);
      $('.project-menu').off('click', 'LI', this.boundClickItem);
      $('.project-menu').off('touchend', '.projects LI', this.boundClickItem);
      $('.clusters').off('mouseenter', 'LI', this.boundEnterCluster);
      $('.clusters, .projects').off('mouseenter', this.boundEnterScrollers);
      $('.clusters, .projects').off('mouseleave', this.boundLeaveScrollers);
    },
  },

  twoLine: computed('pageScope', function() {
    return get(this, 'pageScope') === 'project';
  }),

  hide: computed('pageScope', function() {
    return get(this, 'pageScope') === 'user';
  }),

  projectChoices: computed('scope.allProjects.@each.{id,displayName,relevantState}', function() {
    return get(this, 'scope.allProjects')
      .sortBy('displayName', 'id');
  }),

  maxProjects: computed('byCluster.@each.numProjects', function() {
    const counts = get(this, 'byCluster').map((x) => x.projects.length);

    return Math.max(...counts);
  }),

  byCluster: computed('scope.allClusters.@each.id', 'projectChoices.@each.clusterId', 'cluster.id', function() {
    const currentClusterId = get(this, 'cluster.id');
    const out              = [];
    const navWidth = $('#application nav').width();

    get(this, 'scope.allClusters').forEach((cluster) => {
      getOrAddCluster(cluster);
    });

    get(this, 'projectChoices').forEach((project) => {
      const cluster = get(project, 'cluster');
      const width   = getMaxWidth(textWidth(get(project, 'displayName'), FONT), navWidth);

      if ( !cluster ) {
        return;
      }

      const entry = getOrAddCluster(cluster);

      entry.projects.push(project);
      entry.projectWidth = Math.max(entry.projectWidth, width);
    });

    out.forEach((entry) => {
      entry.projects = entry.projects.sortBy('sortName');
    });

    return out.sortBy('cluster.sortName');

    function getOrAddCluster(cluster) {
      const clusterId = get(cluster, 'id');
      let entry       = out.findBy('clusterId', clusterId);
      let width       = getMaxWidth(textWidth(get(cluster, 'displayName'), FONT), navWidth);

      if ( !entry ) {
        entry = {
          clusterId,
          cluster,
          width,
          projectWidth: 0,
          projects:     [],
          active:       clusterId === currentClusterId,
        };

        out.push(entry);
      }

      return entry;
    }

    function getMaxWidth(width, navWidth) {
      return width >= (navWidth / 2) ? (navWidth / 2) : width;
    }
  }),

  clustersWidth: computed('byCluster.@each.width', function() {
    const widths = get(this, 'byCluster').map((x) => get(x, 'width'));

    return Math.max(...widths);
  }),

  projectsWidth: computed('byCluster.@each.projectWidth', function() {
    const widths = get(this, 'byCluster').map((x) => get(x, 'projectWidth'));

    return Math.max(...widths);
  }),

  clusterSearchResults: computed('searchInput', 'byCluster.[]', function() {
    const needle = get(this, 'searchInput');
    const out = [];

    get(this, 'byCluster').forEach((entry) => {
      const cluster = get(entry, 'cluster');
      const name = get(cluster, 'displayName');
      const { found, match } = highlightMatches(needle, name);

      if ( found ) {
        out.push({
          cluster,
          searchMatch: match,
        })
      }
    });

    return out;
  }),

  projectSearchResults: computed('searchInput', 'byCluster.[]', function() {
    const needle = get(this, 'searchInput');
    const out = [];

    get(this, 'projectChoices').forEach((project) => {
      const name = get(project, 'displayName');
      const { found, match } = highlightMatches(needle, name);

      if ( found ) {
        out.push({
          project,
          cluster:     get(project, 'cluster'),
          searchMatch: match
        })
      }
    });

    return out;
  }),

  keyUp(e) {
    if (!isEmpty(this.dropdownApi)) {
      const project      = 'project';
      const cluster      = 'cluster';
      const code         = e.keyCode;
      let clusterTabList = $('.project-menu .clusters a:first-of-type');
      let projectTabList = $('.project-menu .projects a:first-of-type')
      let tabList        = [];
      let $target        = $(e.target).hasClass('ember-basic-dropdown-trigger') ? $(e.target).find('a') : e.target;
      let currentFocusIndex;
      let currentFocus;
      let nextIndex;
      let activeClusterNode;

      let { clusterEntry } = this;

      if (clusterEntry) {
        activeClusterNode = $(`.project-menu [data-cluster-id="${ clusterEntry.clusterId }"]`);
      }

      if (clusterTabList.index($target) >= 0) {
        currentFocus      = cluster;
        currentFocusIndex = clusterTabList.index($target);
        tabList           = clusterTabList;
      } else if (projectTabList.index($target) >= 0) {
        currentFocus      = project;
        currentFocusIndex = projectTabList.index($target)
        tabList           = projectTabList;
      } else {
        // from inputFocused
        currentFocus      = cluster;
        currentFocusIndex = 0;
      }

      switch (code) {
      case 37: {
        // left
        if (currentFocus === project) {
          activeClusterNode.find('a:first-of-type').focus();
        }
        break;
      }
      case 38: {
        // up
        nextIndex = currentFocusIndex - 1;

        if (tabList && nextIndex >= tabList.length) {
          tabList.eq(tabList.length).focus();
        } else {
          tabList.eq(nextIndex).focus();
        }
        break;
      }
      case 39: {
        // right
        if (currentFocus === cluster && projectTabList.length >= 1) {
          projectTabList.eq(0).focus();
        }
        break;
      }
      case 40: {
        // down
        nextIndex = currentFocusIndex + 1;

        if (nextIndex >= tabList.length) {
          tabList.eq(tabList.length).focus();
        } else {
          tabList.eq(nextIndex).focus();
        }
        break;
      }
      default:
      }
    }

    return false;
  },

  mouseMoved(e) {
    const list = this.mousePoints;
    const x = e.pageX;
    const y = e.pageY;

    if ( list.length ) {
      const last = list[list.length - 1];

      if ( last.x === x && last.y === y ) {
        // Not a movement
        return;
      }
    }

    if ( list.length >= MOUSE_HISTORY ) {
      list.shift();
    }

    list.push({
      x,
      y
    });
  },

  clickMenu(e) {
    if ( e.target.tagName === 'INPUT' ) {
      e.stopPropagation();

      return;
    }
  },

  clickItem(e) {
    const tag = e.target.tagName;

    const li = $(e.target).closest('LI');

    if ( !li ) {
      return;
    }

    if ( li.hasClass('not-ready') ) {
      e.stopPropagation();
      e.preventDefault();

      return;
    }

    if ( tag === 'A' && e.type !== 'touchend' ) {
      return;
    }

    const a = $('A', li)[0];

    if ( !a ) {
      return;
    }

    next(() => {
      this.send('onClose');
      a.click();
    });
  },

  enterCluster(e) {
    if ( get(this, 'searchInput') ) {
      return;
    }

    clearTimeout(this.hoverDelayTimer);

    const $li = $(e.target).closest('LI');
    const id = $li.data('cluster-id');

    if ( id ) {
      const entry = get(this, 'byCluster').findBy('clusterId', id);

      this.maybeHover(entry);
    }
  },

  enterScrollers() {
    clearTimeout(this.leaveDelayTimer);
  },

  leaveScrollers() {
    clearTimeout(this.hoverDelayTimer);

    set(this, 'leaveDelayTimer', setTimeout(() => {
      setProperties(this, {
        hoverEntry:   null,
        clusterEntry: get(this, 'activeClusterEntry'),
      });
    }, MOUSE_DELAY));
  },

  getHoverDelay() {
    const entry  = get(this, 'activeClusterEntry');
    const points = this.mousePoints;
    const $menu  = $('.clusters');

    if ( !entry ) {
      // console.log('No entry');
      return 0;
    }

    if ( !points.length ) {
      // console.log('No points');
      return 0;
    }

    const prev = points[0];
    const now = points[points.length - 1];

    // Bounding box of the menu
    const offset = $menu.offset();
    const left   = offset.left;
    const top    = offset.top - SLOP;
    const right  = left + $menu.outerWidth();
    const bottom = offset.top + $menu.outerHeight() + SLOP;
    const dp     = this.delayPoint;

    if ( dp && dp.x === now.x && dp.y === now.y ) {
      // The mouse hasn't moved during the delay
      // console.log('No movement');
      return 0;
    }

    if ( now.x < prev.x ) {
      // The mouse is moving left
      // console.log('Moving left');
      return 0;
    }

    const nowSlope = slope(prev, now);
    const topSlope = slope(prev, {
      x: right,
      y: top
    }); // negative; 0,0 is top-left
    const botSlope = slope(prev, {
      x: right,
      y: bottom
    }); // positive

    const noMove = prev.x === now.x && prev.y === now.y;
    const topOk = nowSlope >= topSlope;
    const botOk = nowSlope <= botSlope;

    if ( noMove || (topOk && botOk) ) {
      // Moving towards submenu
      this.delayPoint = now;

      // console.log('Ok');
      return MOUSE_DELAY;
    }

    // console.log('Default');
    this.delayPoint = null;

    return 0;
  },

  maybeHover(entry) {
    clearTimeout(this.hoverDelayTimer);

    const delay = this.getHoverDelay();

    if ( delay ) {
      this.hoverDelayTimer = setTimeout(() => {
        this.maybeHover(entry);
      }, delay);
    } else {
      const prev = get(this, 'hoverEntry');

      if ( entry !== prev ) {
        setProperties(this, {
          hoverEntry:   entry,
          clusterEntry: entry,
        });

        let scrollToId;

        entry.projects.forEach((project) => {
          if ( project.active ) {
            scrollToId = project.id;
          }
        });

        if ( scrollToId ) {
          next(() => {
            const li = $(`.projects LI[data-project-id="${ scrollToId }"]`)[0];

            ensureVisible(li);
          });
        }
      }
    }
  },

  onResize() {
    if ( !get(this, 'open') ) {
      return;
    }

    const $window = $(window);
    let want      = Math.max(get(this, 'numClusters'), get(this, 'maxProjects'));
    let roomFor   = Math.ceil( ($window.height() - BUFFER_HEIGHT) / (2 * ITEM_HEIGHT) );
    const rows    = Math.max(3, Math.min(want, roomFor));
    const height  = rows * ITEM_HEIGHT;

    set(this, 'columnStyle', `height: ${ height }px`.htmlSafe());

    let cw = Math.max(MIN_COLUMN_WIDTH, get(this, 'clustersWidth') + 60); // 20px icon, 20px padding, 20px scrollbar
    let pw = Math.max(MIN_COLUMN_WIDTH, get(this, 'projectsWidth') + 60);

    want    = cw + pw;
    roomFor = $window.width() - BUFFER_WIDTH;

    if ( want > roomFor ) {
      cw = Math.floor(cw * roomFor / want);
      pw = roomFor - cw;
    }

    set(this, 'menuStyle', `grid-template-columns: ${ cw }px ${ pw }px`.htmlSafe());
  },

  isTransitioning() {
    if (this.router._routerMicrolib.activeTransition && this.router._routerMicrolib.activeTransition.isTransition) {
      return true
    }

    return false;
  },

});


function highlightMatches(needle, haystack) {
  // This is more complicated than it sounds because:
  // - Needle matches case-insensitive, but the return string should preseve the original haystack case
  // - The haystack has to be HTML escaped
  // - But the HTML entities like &lt; shouldn't appear as search results for "lt"
  // - And we're adding HTML to highlight the matches which needs to not be escaped
  //
  const placeholder = '~';
  let match;
  let found = false;
  const parts = [];

  needle = (needle || '').trim();
  haystack = (haystack || '').trim();

  // 1. If there's any occurrences of the placeholder in the string already, drop them.
  haystack = haystack.replace(placeholder, '', 'g');

  const re = new RegExp(escapeRegex(needle), 'i');

  // 2. Find and save all matches for the needle and replace with placeholder
  /* eslint-disable-next-line no-cond-assign */
  while ( match = haystack.match(re) ) {
    found = true;
    parts.push(match[0]);
    haystack = haystack.replace(re, placeholder);
  }

  if ( !found ) {
    return { found };
  }

  // 3. Escape the resulting string of unmatched chars and placeholders
  haystack = escapeHtml(haystack);
  while ( parts.length ) {
    let token = parts.shift();

    // 4. Replace placeholders with (unescaped) highlight span and (escaped) matched chars
    haystack = haystack.replace(placeholder, `<span class="search-match">${ escapeHtml(token) }</span>`);
  }

  // 5. Return as a safe string
  return {
    found,
    match: haystack.htmlSafe()
  }
}

function slope(a, b) {
  return round(( b.y - a.y ) / ( b.x - a.x ));
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

function ensureVisible(li) {
  const $li = $(li);
  const $ul = $li.closest('UL');
  const ul = $ul[0];

  if ( !ul ) {
    return;
  }

  const ulTop = $ul.scrollTop();
  const ulBottom = ulTop + $ul.outerHeight();
  const offset = $li.offset();

  if (!offset) {
    return;
  }

  const liTop = offset.top;
  const liBottom = liTop + $li.outerHeight();

  // console.log(`${ulTop} to ${ulBottom}, ${liTop} to ${liBottom}`);

  if ( liTop < ulTop || liBottom > ulBottom ) {
    ul.scrollTop = Math.max(0, liTop - ((liBottom - liTop) / 2) + ((ulBottom - ulTop) / 2));
  }
}
