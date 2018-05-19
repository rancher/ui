import { get, set, setProperties } from '@ember/object';
import { computed, observer } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service'
import layout from './template';
import C from 'shared/utils/constants';
import { get as getTree } from 'shared/utils/navigation-tree';
import { run } from '@ember/runloop';

const USER_MENU = [{
  route: 'authenticated.apikeys',
  icon: 'icon-key',
  localizedLabel: 'nav.api.link',
}, {
  route: 'authenticated.node-templates',
  icon: 'icon-host',
  localizedLabel: 'nav.nodeTemplates.link',
}, {
  route: 'authenticated.prefs',
  icon: 'icon-gear',
  localizedLabel: 'nav.userPreferences.link',
}];

function fnOrValue(val, ctx) {
  if ( typeof val === 'function' )
  {
    return val.call(ctx);
  }
  else
  {
    return val;
  }
}


export default Component.extend({
  layout,
  // Inputs
  pageScope:        null,
  classNames:       null,
  responsiveNav:    true,

  // Injections
  intl:             service(),
  scope:            service(),
  settings:         service(),
  access:           service(),
  prefs:            service(),

  clusterId:        alias('scope.currentCluster.id'),
  cluster:          alias('scope.currentCluster'),
  projectId:        alias('scope.currentProject.id'),
  project:          alias('scope.currentProject'),
  isCaas:           equal('app.mode',C.MODE.CAAS),
  isOss:            equal('app.mode',C.MODE.OSS),
  accessEnabled:    alias('access.enabled'),

  // Component options
  tagName:          'header',
  dropdownSelector: '.navbar .dropdown',

  stacks:           null,
  userMenuExpanded: false,
  userMenus:        USER_MENU,

  actions: {
    toogleExpand(selected) {
      get(this, 'navTree').forEach((item) => {
        if ( item === selected ) {
          set(item, 'expanded', !get(item, 'expanded'));
        } else {
          set(item, 'expanded', false);
        }
      });
      
      set(this, 'userMenuExpanded', false);
    },

    toogleUserMenu() {
      get(this, 'navTree').forEach((item) => {
        set(item, 'expanded', false);
      });
      set(this, 'userMenuExpanded', !get(this, 'userMenuExpanded'));
    }
  },

  routeDidChange: observer('application.currentRouteName', function() {
    const currentRouteName = this.get('application.currentRouteName');
    
    get(this, 'navTree').forEach((item) => {
      if ( get(item, 'expanded') ) {
        const submenuActive = (get(item, 'submenu') || []).some((subitem) => currentRouteName.startsWith(get(subitem, 'route')));
        if ( !submenuActive ) {
          set(item, 'expanded', false);
        }
      }
    });
    if ( get(this, 'userMenuExpanded') ) {
      const submenuActive = get(this, 'userMenus').some((subitem) => currentRouteName.startsWith(get(subitem, 'route')));
      if ( !submenuActive ) {
        set(this, 'userMenuExpanded', false);
      }
    }
  }),

  willRender() {
    if ($('BODY').hasClass('touch') && $('header > nav').hasClass('nav-open')) {// eslint-disable-line
      run.later(() => {
        $('header > nav').removeClass('nav-open');// eslint-disable-line
      });
    }
  },

  init() {
    this._super(...arguments);
    get(this, 'intl.locale');

    setProperties(this, {
      stacks:      get(this, 'store').all('stack'),
      hosts:       get(this, 'store').all('host'),
      stackSchema: get(this, 'store').getById('schema','stack'),
    });

    this.updateNavTree();

    run.scheduleOnce('render', () => {
      if ( !get(this, 'responsiveNav') ) {
        return;
      }
      //responsive nav 63-87
      var responsiveNav = document.getElementById('js-responsive-nav');

      var toggleBtn = document.createElement('a');
      toggleBtn.setAttribute('class', 'nav-toggle');
      responsiveNav.insertBefore(toggleBtn, responsiveNav.firstChild);

      function hasClass(e,t){return(new RegExp(' '+t+' ')).test(' '+e.className+' ')}

      function toggleClass(e,t){var n=' '+e.className.replace(/[\t\r\n]/g,' ')+' ';if(hasClass(e,t)){while(n.indexOf(' '+t+' ')>=0){n=n.replace(' '+t+' ',' ')}e.className=n.replace(/^\s+|\s+$/g,'')}else{e.className+=' '+t}}

      toggleBtn.onclick = function() {
          toggleClass(this.parentNode, 'nav-open');
      }

      var root = document.documentElement;
      root.className = root.className + ' js';
    });
  },

  // This computed property generates the active list of choices to display
  navTree: null,
  updateNavTree() {
    const currentRouteName = this.get('application.currentRouteName');

    let currentScope = get(this, 'pageScope');

    let out = getTree().filter((item) => {

      if ( typeof get(item, 'condition') === 'function' ) {

        if ( !item.condition.call(this) ) {
          return false;
        }

      }

      if ( get(item, 'scope') && get(item, 'scope') !== currentScope ) {
        return false;
      }

      setProperties(item, {
        localizedLabel: fnOrValue(get(item, 'localizedLabel'), this),
        label:          fnOrValue(get(item, 'label'), this),
        route:          fnOrValue(get(item, 'route'), this),
        ctx:            (get(item, 'ctx')||[]).map( prop =>  fnOrValue(prop, this)),
        submenu:        fnOrValue(get(item, 'submenu'), this),
      });

      set(item, 'submenu', ( get(item, 'submenu') || [] ).filter((subitem) => {

        if ( typeof get(subitem, 'condition') === 'function' && !subitem.condition.call(this) ) {
          return false;
        }

        if ( currentRouteName.startsWith(get(subitem, 'route')) ) {
          set(item, 'expanded', true);
        }

        setProperties(subitem, {
          localizedLabel: fnOrValue(get(subitem, 'localizedLabel'), this),
          label:          fnOrValue(get(subitem, 'label'), this),
          route:          fnOrValue(get(subitem, 'route'), this),
          ctx:            ( get(subitem, 'ctx') || [] ).map( prop => fnOrValue(prop, this)),
        });

        return true;
      }));

      return true;
    });

    set(this, 'navTree', out);

    const userMenuActive = get(this, 'userMenus').some((subitem) => currentRouteName.startsWith(get(subitem, 'route')));
    if ( userMenuActive ) {
      set(this, 'userMenuExpanded', true);
    }
  },

  shouldUpdateNavTree: observer(
    'pageScope',
    'clusterId',
    'cluster.isReady',
    'projectId',
    'stacks.@each.group',
    `prefs.${C.PREFS.ACCESS_WARNING}`,
    'access.enabled',
    'intl.locale',
    function() {
      run.scheduleOnce('afterRender', this, 'updateNavTree');
    }
  ),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  hasProject: computed('project', function() {
    return !!get(this, 'project');
  }),

  // Hackery: You're an owner if you can write to the 'system' field of a stack
  isOwner: computed('stackSchema.resourceFields.system.update', function() {
    return !!get(this, 'stackSchema.resourceFields.system.update');
  }),
});
