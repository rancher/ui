import { get, set, setProperties } from '@ember/object';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service'
import layout from './template';
import C from 'shared/utils/constants';
import { get as getTree } from 'shared/utils/navigation-tree';
import { run } from '@ember/runloop';
import $ from 'jquery';

function fnOrValue(val, ctx) {
  if ( typeof val === 'function' ) {
    return val.call(ctx);
  } else {
    return val;
  }
}


export default Component.extend({
  // Injections
  intl:             service(),
  scope:            service(),
  features:         service(),
  settings:         service(),
  access:           service(),
  prefs:            service(),
  router:           service(),

  layout,
  // Inputs
  pageScope:        null,

  // Component options
  tagName:          'header',
  classNames:       ['page-header'],
  dropdownSelector: '.navbar .dropdown',

  stacks:           null,

  // This computed property generates the active list of choices to display
  navTree:       null,
  clusterId:        alias('scope.currentCluster.id'),
  cluster:          alias('scope.currentCluster'),
  projectId:        alias('scope.currentProject.id'),
  project:          alias('scope.currentProject'),
  accessEnabled:    alias('access.enabled'),

  init() {
    this._super(...arguments);
    get(this, 'intl.locale');

    setProperties(this, {
      stacks:      get(this, 'store').all('stack'),
      hosts:       get(this, 'store').all('host'),
      stackSchema: get(this, 'store').getById('schema', 'stack'),
    });

    run.once(this, 'updateNavTree');

    run.scheduleOnce('render', () => {
      // responsive nav 63-87
      var responsiveNav = document.getElementById('js-responsive-nav');

      var toggleBtn = document.createElement('a');

      toggleBtn.setAttribute('class', 'nav-toggle');
      responsiveNav.insertBefore(toggleBtn, responsiveNav.firstChild);

      function hasClass(e, t){
        return (new RegExp(` ${ t } `)).test(` ${ e.className } `)
      }

      function toggleClass(e, t){
        var n = ` ${  e.className.replace(/[\t\r\n]/g, ' ')  } `;

        if (hasClass(e, t)){
          while (n.indexOf(` ${ t } `) >= 0){
            n = n.replace(` ${ t } `, ' ')
          }e.className = n.replace(/^\s+|\s+$/g, '')
        } else {
          e.className += ` ${  t }`
        }
      }

      toggleBtn.onclick = function() {
        toggleClass(this.parentNode, 'nav-open');
      }

      var root = document.documentElement;

      root.className = `${ root.className  } js`;
    });
  },

  didInsertElement() {
    run.scheduleOnce('afterRender', this, function() {
      this.get('router').on('routeWillChange', () => {
        $('header > nav').removeClass('nav-open');// eslint-disable-line
      });
    });
  },

  shouldUpdateNavTree: observer(
    'pageScope',
    'clusterId',
    'cluster.isReady',
    'projectId',
    'stacks.@each.group',
    `prefs.${ C.PREFS.ACCESS_WARNING }`,
    'access.enabled',
    'intl.locale',
    function() {
      run.scheduleOnce('afterRender', this, 'updateNavTree');
    }
  ),

  // beyond things listed in "Inputs"
  hasProject: computed('project', function() {
    return !!get(this, 'project');
  }),

  // Hackery: You're an owner if you can write to the 'system' field of a stack
  isOwner: computed('stackSchema.resourceFields.system.update', function() {
    return !!get(this, 'stackSchema.resourceFields.system.update');
  }),

  dashboardLink: computed('pageScope', 'clusterId', 'cluster.isReady', function() {
    if ( !get(this, 'features').isFeatureEnabled(C.FEATURES.DASHBOARD) ) {
      // Only if Steve/dashboard are deployed
      return;
    }

    if ( get(this, 'pageScope') === 'global' || !this.clusterId ) {
      // Only inside a cluster
      return;
    }

    const cluster = get(this, 'cluster');

    if ( !cluster || !cluster.isReady ) {
      // Only in ready/active clusters
      return;
    }

    return get(this, 'scope.dashboardLink');
  }),

  updateNavTree() {
    const currentScope = get(this, 'pageScope');

    const out = getTree().filter((item) => {
      if ( typeof get(item, 'condition') === 'function' ) {
        if ( !item.condition.call(this) ) {
          return false;
        }
      }

      if ( get(item, 'scope') && get(item, 'scope') !== currentScope ) {
        return false;
      }

      const itemRoute = fnOrValue(get(item, 'route'), this);
      const itemContext = (get(item, 'ctx') || []).map( (prop) =>  fnOrValue(prop, this));

      setProperties(item, {
        localizedLabel: fnOrValue(get(item, 'localizedLabel'), this),
        label:          fnOrValue(get(item, 'label'), this),
        route:          itemRoute,
        ctx:            itemContext,
        submenu:        fnOrValue(get(item, 'submenu'), this),
      });

      set(item, 'submenu', ( get(item, 'submenu') || [] ).filter((subitem) => {
        if ( typeof get(subitem, 'condition') === 'function' && !subitem.condition.call(this) ) {
          return false;
        }

        const subItemRoute = fnOrValue(get(subitem, 'route'), this);
        const subItemContext = ( get(subitem, 'ctx') || [] ).map( (prop) => fnOrValue(prop, this));

        setProperties(subitem, {
          localizedLabel: fnOrValue(get(subitem, 'localizedLabel'), this),
          label:          fnOrValue(get(subitem, 'label'), this),
          route:          subItemRoute,
          ctx:            subItemContext,
        });

        return true;
      }));

      return true;
    });

    const old = JSON.stringify(get(this, 'navTree'));
    const neu = JSON.stringify(out);

    if ( old !== neu ) {
      set(this, 'navTree', out);
    }
  },

  keyUp(e) {
    const code            = e.keyCode;
    let tabList           = $(`.nav-item a:first-of-type`);
    let $target           = $(e.target).hasClass('ember-basic-dropdown-trigger') ? $(e.target).find('a') : e.target;
    let currentFocusIndex = tabList.index($target);
    let nextIndex;

    switch (code) {
    case 37: {
      // left
      nextIndex = currentFocusIndex - 1;

      if (nextIndex >= tabList.length) {
        tabList.eq(tabList.length).focus();
      } else {
        if (tabList.eq(nextIndex).parent().hasClass('ember-basic-dropdown-trigger')) {
          tabList.eq(nextIndex).parent().focus();
        } else {
          tabList.eq(nextIndex).focus();
        }
      }

      break;
    }
    case 39: {
      // right
      nextIndex = currentFocusIndex + 1;

      if (nextIndex >= tabList.length) {
        tabList.eq(0).focus();
      } else {
        if (tabList.eq(nextIndex).parent().hasClass('ember-basic-dropdown-trigger')) {
          tabList.eq(nextIndex).parent().focus();
        } else {
          tabList.eq(nextIndex).focus();
        }
      }

      break;
    }
    default:
    }
  },

});
