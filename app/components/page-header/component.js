import Ember from 'ember';
import C from 'ui/utils/constants';
import {get as getTree} from 'ui/utils/navigation-tree';
import HoverDropdown from 'ui/mixins/hover-dropdowns';

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


export default Ember.Component.extend(HoverDropdown, {
  // Inputs
  hasCattleSystem      : null,
  currentPath          : null,

  // Injections
  projects             : Ember.inject.service(),
  project              : Ember.computed.alias('projects.current'),
  projectId            : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),
  catalog              : Ember.inject.service(),
  settings             : Ember.inject.service(),
  access               : Ember.inject.service(),
  prefs                : Ember.inject.service(),
  isAdmin              : Ember.computed.alias('access.admin'),
  hasVm                : Ember.computed.alias('project.virtualMachine'),
  hasSwarm             : Ember.computed.alias('projects.orchestrationState.hasSwarm'),
  hasKubernetes        : Ember.computed.alias('projects.orchestrationState.hasKubernetes'),
  hasMesos             : Ember.computed.alias('projects.orchestrationState.hasMesos'),
  swarmReady           : Ember.computed.alias('projects.orchestrationState.swarmReady'),
  mesosReady           : Ember.computed.alias('projects.orchestrationState.mesosReady'),
  stacks               : null,

  // Component options
  tagName              : 'header',
  classNames           : ['clearfix','no-select'],
  dropdownSelector     : '.navbar .dropdown',

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },
  },

  init() {
    this._super(...arguments);
    this.set('stacks', this.get('store').all('stack'));
    this.set('hosts', this.get('store').all('host'));
    this.set('stackSchema', this.get('store').getById('schema','stack'));
    this.updateNavTree();
  },

  // This computed property generates the active list of choices to display
  navTree: null,
  updateNavTree() {
    let out = getTree().filter((item) => {
      if ( typeof item.condition === 'function' )
      {
        if ( !item.condition.call(this) )
        {
          return false;
        }
      }

      item.localizedLabel = fnOrValue(item.localizedLabel, this);
      item.label = fnOrValue(item.label, this);
      item.route = fnOrValue(item.route, this);
      item.ctx = (item.ctx||[]).map((prop) => {
        return fnOrValue(prop, this);
      });
      item.submenu = fnOrValue(item.submenu, this);

      item.showAlert = false;
      if ( typeof item.alertCondition === 'function' && item.alertCondition.call(this) === true ) {
        item.showAlert = true;
      }

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
    Ember.run.once(this, 'updateNavTree');
  }.observes(
    'projectId',
    'projects.orchestrationState',
    'project.virtualMachine',
    'stacks.@each.group',
    'catalog.catalogs.@each.{id,name}',
    `settings.${C.SETTING.CATALOG_URL}`,
    `prefs.${C.PREFS.ACCESS_WARNING}`,
    'access.enabled',
    'isAdmin'
  ),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  hasProject: function() {
    return !!this.get('project');
  }.property('project'),

  canEdit: function() {
    return !!this.get('project.actionLinks.update') || !!this.get('project.actionLinks.setmembers');
  }.property('project.actionLinks.{update,setmembers}'),

  kubernetesReady: function() {
    return this.get('hasKubernetes') &&
    this.get('projects.orchestrationState.kubernetesReady');
  }.property('hasKubernetes','projects.orchestrationState.kubernetesReady'),
});
