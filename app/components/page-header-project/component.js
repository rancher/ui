import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { get, set, computed } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import textWidth from 'shared/utils/text-width';
import { next } from '@ember/runloop';
import { escapeRegex, escapeHtml } from 'shared/utils/util';
import $ from 'jquery';

const ITEM_HEIGHT = 50;
const BUFFER_HEIGHT = 150;
const BUFFER_WIDTH = 150;
const MIN_COLUMN_WIDTH = 200;
const FONT = '13.5px "Prompt", "Helvetica Neue Light", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const MOUSE_HISTORY = 5;
const MOUSE_DELAY = 250;
const SLOP = 50; // Extend the ends of the target triangle out by this many px

export default Component.extend(ThrottledResize, {
  access:             service(),
  scope:              service(),
  globalStore:        service(),
  router:             service(),

  layout,
  pageScope:          null,

  tagName:            'LI',
  classNames:         ['dropdown', 'nav-item', 'nav-cluster'],
  classNameBindings:  ['hide'],

  searchInput:        '',
  open:               false,

  columnStyle:        '',
  menuStyle:          '',
  mousePoints:        null,
  clusterEntry:       null,
  activeClusterEntry: null,
  hoverEntry:         null,
  hoverDelayTimer:    null,
  delayPoint:         null,
  leaveDelayTimer:    null,

  boundClickMenu:     null,
  boundClickItem:     null,
  boundEnterCluster:  null,

  project:            alias('scope.pendingProject'),
  cluster:            alias('scope.pendingCluster'),
  numClusters:        alias('byCluster.length'),

  init() {
    this._super(...arguments);
    set(this, 'mousePoints', []);
    set(this, 'boundMouseMove', this.mouseMoved.bind(this));
    set(this, 'boundClickMenu', this.clickMenu.bind(this));
    set(this, 'boundClickItem', this.clickItem.bind(this));
    set(this, 'boundEnterCluster', this.enterCluster.bind(this));
    set(this, 'boundEnterScrollers', this.enterScrollers.bind(this));
    set(this, 'boundLeaveScrollers', this.leaveScrollers.bind(this));
  },

  actions: {
    onOpen() {
      set(this, 'open', true);
      this.onResize();

      next(() => {
        const menu = this.$('.project-menu');
        const clusters = this.$('.clusters');

        $(document).on('mousemove', this.boundMouseMove);

        menu.on('click', this.boundClickMenu);
        menu.on('click', 'LI', this.boundClickItem);

        clusters.on('focus', 'LI', this.boundEnterCluster);
        clusters.on('mouseenter', 'LI', this.boundEnterCluster);

        this.$('.clusters, .projects').on('mouseenter', this.boundEnterScrollers);
        this.$('.clusters, .projects').on('mouseleave', this.boundLeaveScrollers);

        this.$('.search INPUT')[0].focus();

        this.$('.clusters UL')[0].scrollTop = 0;
        this.$('.projects UL')[0].scrollTop = 0;

        const currentClusterId = get(this, 'cluster.id');
        const currentProjectId = get(this, 'project.id');

        if ( currentClusterId ) {
          const li = this.$(`.clusters LI[data-cluster-id="${ currentClusterId }"]`)[0];
          const entry = get(this, 'byCluster').findBy('clusterId', currentClusterId);

          ensureVisible(li);
          set(this, 'clusterEntry', entry);
          set(this, 'activeClusterEntry', entry);
        }

        if ( currentProjectId ) {
          next(() => {
            const li = this.$(`.projects LI[data-project-id="${ currentProjectId }"]`)[0];

            ensureVisible(li);
          });
        }
      });
    },

    onClose() {
      set(this, 'open', false);
      set(this, 'searchInput', '');
      set(this, 'hoverEntry', null);
      set(this, 'clusterEntry', null);
      set(this, 'activeClusterEntry', null);

      $(document).off('mousemove', this.boundMouseMove);
      this.$('.project-menu').off('click', this.boundClickMenu);
      this.$('.project-menu').off('click', 'LI', this.boundClickItem);
      this.$('.clusters').off('mouseenter', 'LI', this.boundEnterCluster);
      this.$('.clusters, .projects').off('mouseenter', this.boundEnterScrollers);
      this.$('.clusters, .projects').off('mouseleave', this.boundLeaveScrollers);
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
    const out = [];

    get(this, 'scope.allClusters').forEach((cluster) => {
      getOrAddCluster(cluster);
    });

    get(this, 'projectChoices').forEach((project) => {
      const cluster = get(project, 'cluster');
      const width = textWidth(get(project, 'displayName'), FONT);

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
      let entry = out.findBy('clusterId', clusterId);

      if ( !entry ) {
        entry = {
          clusterId,
          cluster,

          width:        textWidth(get(cluster, 'displayName'), FONT),
          projectWidth: 0,
          projects:     [],
          active:       clusterId === currentClusterId,
        };

        out.push(entry);
      }

      return entry;
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

    if ( tag === 'A' ) {
      return;
    }

    const a = $('A', li)[0];

    if ( !a ) {
      return;
    }

    a.click();
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
      set(this, 'hoverEntry', null);
      set(this, 'clusterEntry', get(this, 'activeClusterEntry'));
    }, MOUSE_DELAY));
  },

  getHoverDelay() {
    const entry = get(this, 'activeClusterEntry');
    const points = this.mousePoints;
    const $menu = this.$('.clusters');

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
    const left = offset.left;
    const top = offset.top - SLOP;
    const right = left + $menu.outerWidth();
    const bottom = offset.top + $menu.outerHeight() + SLOP;
    const dp = this.delayPoint;

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
        set(this, 'hoverEntry', entry);
        set(this, 'clusterEntry', entry);

        let scrollToId;

        entry.projects.forEach((project) => {
          if ( project.active ) {
            scrollToId = project.id;
          }
        });

        if ( scrollToId ) {
          next(() => {
            const li = this.$(`.projects LI[data-project-id="${ scrollToId }"]`)[0];

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
    let want    = Math.max(get(this, 'numClusters'), get(this, 'maxProjects'));
    let roomFor = Math.ceil( ($window.height() - BUFFER_HEIGHT) / (2 * ITEM_HEIGHT) );

    const rows = Math.max(3, Math.min(want, roomFor));
    const height = rows * ITEM_HEIGHT;

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
