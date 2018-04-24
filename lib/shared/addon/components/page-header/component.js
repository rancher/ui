import { computed } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service'
import layout from './template';
import C from 'shared/utils/constants';
import { get as getTree } from 'shared/utils/navigation-tree';
import HoverDropdown from 'shared/mixins/hover-dropdowns';
import { run } from '@ember/runloop';

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


export default Component.extend(HoverDropdown, {
  layout,
  // Inputs
  pageScope: null,

  // Injections
  intl                 : service(),
  scope                : service(),
  settings             : service(),
  access               : service(),
  prefs                : service(),

  clusterId            : alias('scope.currentCluster.id'),
  cluster              : alias('scope.currentCluster'),
  projectId            : alias('scope.currentProject.id'),
  project              : alias('scope.currentProject'),
  isCaas               : equal('app.mode',C.MODE.CAAS),
  isOss                : equal('app.mode',C.MODE.OSS),
  accessEnabled        : alias('access.enabled'),

  // Component options
  tagName              : 'header',
  classNames           : ['page-header'],
  dropdownSelector     : '.navbar .dropdown',

  stacks               : null,

  willRender() {
    if ($('BODY').hasClass('touch') && $('header > nav').hasClass('nav-open')) {
      run.later(() => {
        $('header > nav').removeClass('nav-open');
      });
    }
  },

  init() {
    this._super(...arguments);
    this.get('intl.locale');
    this.set('stacks', this.get('store').all('stack'));
    this.set('hosts', this.get('store').all('host'));
    this.set('stackSchema', this.get('store').getById('schema','stack'));
    this.updateNavTree();

    run.scheduleOnce('render', () => {
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
    let currentScope = this.get('pageScope');

    let out = getTree().filter((item) => {
      if ( typeof item.condition === 'function' )
      {
        if ( !item.condition.call(this) )
        {
          return false;
        }
      }

      if ( item.scope && item.scope !== currentScope ) {
        return false;
      }

      item.localizedLabel = fnOrValue(item.localizedLabel, this);
      item.label = fnOrValue(item.label, this);
      item.route = fnOrValue(item.route, this);
      item.ctx = (item.ctx||[]).map((prop) => {
        return fnOrValue(prop, this);
      });
      item.submenu = fnOrValue(item.submenu, this);

      item.submenu = (item.submenu||[]).filter((subitem) => {
        if ( typeof subitem.condition === 'function' && !subitem.condition.call(this) ) {
          return false;
        }

        subitem.localizedLabel = fnOrValue(subitem.localizedLabel, this);
        subitem.label = fnOrValue(subitem.label, this);
        subitem.route = fnOrValue(subitem.route, this);
        subitem.ctx = (subitem.ctx||[]).map((prop) => {
          return fnOrValue(prop, this);
        });

        return true;
      });

      return true;
    });

    this.set('navTree', out);
  },

  shouldUpdateNavTree: function() {
    run.scheduleOnce('afterRender', this, 'updateNavTree');
  }.observes(
    'pageScope',
    'clusterId',
    'cluster.isReady',
    'projectId',
    'stacks.@each.group',
    `prefs.${C.PREFS.ACCESS_WARNING}`,
    'access.enabled',
    'intl.locale'
  ),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  hasProject: computed('project', function() {
    return !!this.get('project');
  }),

  // Hackery: You're an owner if you can write to the 'system' field of a stack
  isOwner: computed('stackSchema.resourceFields.system.update', function() {
    return !!this.get('stackSchema.resourceFields.system.update');
  }),
});
