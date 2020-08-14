import { reject, Promise as EmberPromise } from 'rsvp';
import { computed, get } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { ucFirst, sortableNumericSuffix } from 'ui/utils/util';
import C from 'ui/utils/constants';
import { downloadResourceYaml } from 'shared/utils/download-files';

function terminatedIcon(inst) {
  if ( get(inst, 'exitCode') === 0 ) {
    return 'icon icon-dot-circlefill';
  } else {
    return 'icon icon-circle';
  }
}

function terminatedColor(inst) {
  if ( get(inst, 'exitCode') === 0 ) {
    return 'text-success';
  } else {
    return 'text-error';
  }
}

const defaultStateMap = {
  'aborted':                    {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'activating':               {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'active':                   {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'available':                {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'bound':                    {
    icon:  'icon icon-circle',
    color: 'text-success'
  },
  'backedup':                 {
    icon:  'icon icon-backup',
    color: 'text-success'
  },
  'building':                 {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'created':                  {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'creating':                 {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'denied':                   {
    icon:  'icon icon-adjust',
    color: 'text-error'
  },
  'deactivating':             {
    icon:  'icon icon-adjust',
    color: 'text-info'
  },
  'degraded':                 {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'disconnected':             {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'disabled': {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'error':                    {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'erroring':                 {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'expired':                  {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'fail':                   {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'failed':                   {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'healthy':                  {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'locked':                   {
    icon:  'icon icon-adjust',
    color: 'text-warning'
  },
  'in-progress':              {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'inactive':                 {
    icon:  'icon icon-circle',
    color: 'text-error'
  },
  'initializing':             {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'migrating':                {
    icon:  'icon icon-info',
    color: 'text-info'
  },
  'pass':                  {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'paused':                   {
    icon:  'icon icon-info',
    color: 'text-info'
  },
  'provisioning':             {
    icon:  'icon icon-circle',
    color: 'text-info'
  },
  'pending':                  {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'purged':                   {
    icon:  'icon icon-purged',
    color: 'text-error'
  },
  'purging':                  {
    icon:  'icon icon-purged',
    color: 'text-info'
  },
  'reconnecting':             {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'registering':              {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'released':                 {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'reinitializing':           {
    icon:  'icon icon-alert',
    color: 'text-warning'
  },
  'removed':                  {
    icon:  'icon icon-trash',
    color: 'text-error'
  },
  'removing':                 {
    icon:  'icon icon-trash',
    color: 'text-info'
  },
  'requested':                {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
  'restarting':               {
    icon:  'icon icon-adjust',
    color: 'text-info'
  },
  'restoring':                {
    icon:  'icon icon-medicalcross',
    color: 'text-info'
  },
  'running':                  {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'starting':                 {
    icon:  'icon icon-adjust',
    color: 'text-info'
  },
  'stopped':                  {
    icon:  'icon icon-circle',
    color: 'text-error'
  },
  'stopping':                 {
    icon:  'icon icon-adjust',
    color: 'text-info'
  },
  'succeeded':                {
    icon:  'icon icon-dot-circlefill',
    color: 'text-success'
  },
  'success':                  {
    icon:  'icon icon-circle-o',
    color: 'text-success'
  },
  'suspended':                {
    icon:  'icon icon-pause',
    color: 'text-info'
  },
  'skipped':                  {
    icon:  'icon icon-circle-o',
    color: 'text-info'
  },
  'terminated':               {
    icon:  terminatedIcon,
    color: terminatedColor
  },
  'unavailable':              {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'unhealthy':                {
    icon:  'icon icon-alert',
    color: 'text-error'
  },
  'unknown':                  {
    icon:  'icon icon-help',
    color: 'text-warning'
  },
  'untriggered':              {
    icon:  'icon icon-tag',
    color: 'text-success'
  },
  'updating':                 {
    icon:  'icon icon-tag',
    color: 'text-warning'
  },
  'upgrading':                {
    icon:  'icon icon-tag',
    color: 'text-warning'
  },
  'waiting':                  {
    icon:  'icon icon-tag',
    color: 'text-info'
  },
};

const stateColorSortMap = {
  'error':   1,
  'warning': 2,
  'info':    3,
  'success': 4,
  'other':   5,
};

export default Mixin.create({
  endpointSvc: service('endpoint'), // Some machine drivers have a property called 'endpoint'
  cookies:     service(),
  growl:       service(),
  intl:        service(),
  session:     service(),

  modalService: service('modal'),
  reservedKeys: ['waitInterval', 'waitTimeout'],

  state:                 null,
  transitioning:         null,
  transitioningMessage:  null,
  transitioningProgress: null,

  availableActions: computed(() => {
    /*
      For custom actions not in _availableActions below, Override me and return [
        {
          enabled: true/false,    // Whether it's shown or not.  Anything other than exactly false will be shown.
          bulkable: true/false,   // If true, the action is shown in bulk actions on sortable-tables
          single: true/false,     // If exactly false, the action is not shown on individual resource actions (with bulkable=true for a bulk-only action)
          label: 'Delete',        // Label shown on hover or in menu
          icon: 'icon icon-trash',// Icon shown on screen
          action: 'promptDelete', // Action to call on the controller when clicked
          altAction: 'delete'     // Action to call on the controller when alt+clicked
          divider: true,          // Just this will make a divider
        },
        ...
      ]
    */
    return [];
  }),

  _availableActions: computed('availableActions.[]', 'links.{self,yaml}', 'canEdit', 'canEditYaml', 'canViewYaml', 'canRemove', 'grafanaUrl', function() {
    const out = get(this, 'availableActions').slice();

    let nextSort = 1;

    out.forEach((entry) => {
      if ( !entry.sort ) {
        entry.sort = nextSort++;
      }
    });

    const l = get(this, 'links') || {};

    out.push({
      sort:    -99,
      label:   'action.edit',
      icon:    'icon icon-edit',
      action:  'edit',
      enabled: get(this, 'canEdit'),
    });

    out.push({
      sort:    -98,
      label:   'action.clone',
      action:  'clone',
      icon:    'icon icon-copy',
      enabled: get(this, 'canClone'),
    });

    // Normal actions go here in the sort order

    out.push({
      sort:    94,
      divider: true
    });

    out.push({
      sort:    95,
      label:   'action.editYaml',
      icon:    'icon icon-edit',
      action:  'editYaml',
      enabled: !!l.yaml && get(this, 'canEditYaml'),
    });

    out.push({
      sort:    96,
      label:   'action.viewYaml',
      icon:    'icon icon-file',
      action:  'viewYaml',
      enabled: get(this, 'canViewYaml'),
    });

    out.push({
      sort:     97,
      label:    'action.downloadYaml',
      icon:     'icon icon-download',
      action:   'downloadYaml',
      bulkable: true,
      single:   false,
      enabled:  get(this, 'canDownloadYaml'),
    });

    out.push({
      sort:    98,
      label:   'action.viewInApi',
      icon:    'icon icon-external-link',
      action:  'goToApi',
      enabled: !!l.self
    });

    out.push({
      sort:    99,
      label:   'action.viewInGrafana',
      icon:    'icon icon-link',
      action:  'goToGrafana',
      enabled: !!get(this, 'grafanaUrl'),
    });

    out.push({
      sort:    100,
      divider: true
    });
    out.push({
      sort:      101,
      label:     'action.remove',
      icon:      'icon icon-trash',
      action:    'promptDelete',
      altAction: get(this, 'getAltActionDelete'),
      bulkable:  get(this, 'canBulkRemove'),
      enabled:   get(this, 'canRemove'),
    });

    return out.sortBy('sort');
  }),

  getAltActionDelete: computed('action.remove', function() { // eslint-disable-line
    // eks clusters with session tokens can't be deleted with alt actions because of the verification of keys that needs to occur

    return 'delete';
  }),

  canBulkRemove: computed('action.remove', function() { // eslint-disable-line
    return true;
  }),

  canClone: computed('actions.clone', function() {
    return !!get(this, 'actions.clone');
  }),

  canEditYaml: alias('canEdit'),

  canViewYaml: computed('links.@each', 'canEditYaml', function() {
    return !!get(this, 'links.yaml') && !get(this, 'canEditYaml');
  }),

  canDownloadYaml: computed('links.@each', function() {
    return !!get(this, 'links.yaml');
  }),

  canEdit: computed('links.@each', 'actions.edit', function() {
    return !!get(this, 'links.update') && !!get(this, 'actions.edit');
  }),

  canRemove: computed('links.@each', function() {
    return !!get(this, 'links.remove');
  }),

  actions: {
    promptDelete() {
      get(this, 'modalService').toggleModal('confirm-delete', {
        escToClose: true,
        resources:  [this]
      });
    },

    delete() {
      return this.delete();
    },

    downloadYaml() {
      downloadResourceYaml([this]);
    },

    editYaml(){
      get(this, 'modalService').toggleModal('modal-yaml', {
        escToClose: true,
        resource:   this
      });
    },

    viewYaml(){
      get(this, 'modalService').toggleModal('modal-yaml', {
        escToClose: true,
        resource:   this,
        readOnly:   true
      });
    },

    goToApi() {
      let url      = get(this, 'links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running

      window.open(url, '_blank');
    },

    goToGrafana() {
      let url = get(this, 'grafanaUrl');

      window.open(url, '_blank');
    },
  },

  displayName: computed('name', 'id', function() {
    return get(this, 'name') || `(${ get(this, 'id') })`;
  }),

  sortName: computed('displayName', function() {
    return sortableNumericSuffix(get(this, 'displayName').toLowerCase());
  }),

  isTransitioning: equal('transitioning', 'yes'),
  isError:         equal('transitioning', 'error'),
  isActive:        equal('state', 'active'),

  relevantState: computed('combinedState', 'state', function() {
    return get(this, 'combinedState') || get(this, 'state') || 'unknown';
  }),

  // This is like this so you can override the displayed state calculation
  displayState:  alias('_displayState'),
  _displayState: computed('relevantState', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const state = get(this, 'relevantState') || '';
    const key = `resourceState.${ (state || 'unknown').toLowerCase() }`;

    if ( intl.locale && intl.exists(key) ) {
      return intl.t(key);
    }

    return state.split(/-/).map((word) => {
      return ucFirst(word);
    }).join('-');
  }),

  showTransitioningMessage: computed('transitioning', 'transitioningMessage', 'displayState', function() {
    var trans = get(this, 'transitioning');

    if (trans === 'yes' || trans === 'error') {
      let message = (get(this, 'transitioningMessage') || '');

      if ( message.length && message.toLowerCase() !== get(this, 'displayState').toLowerCase() ) {
        return true;
      }
    }

    return false;
  }),

  stateIcon: computed('relevantState', 'transitioning', function() {
    var trans = get(this, 'transitioning');
    var icon = '';

    if ( trans === 'yes' ) {
      icon = 'icon icon-spinner icon-spin';
    } else if ( trans === 'error' ) {
      icon = 'icon icon-alert';
    } else {
      var map = this.constructor.stateMap;
      var key = (get(this, 'relevantState') || '').toLowerCase();

      if ( map && map[key] && map[key].icon !== undefined) {
        if ( typeof map[key].icon === 'function' ) {
          icon = map[key].icon(this);
        } else {
          icon = map[key].icon;
        }
      }

      if ( !icon && defaultStateMap[key] && defaultStateMap[key].icon ) {
        let tmp = defaultStateMap[key].icon;

        if ( typeof tmp === 'function' ) {
          icon = tmp(this);
        } else {
          icon = tmp;
        }
      }

      if ( !icon ) {
        icon = this.constructor.defaultStateIcon;
      }

      if ( icon.indexOf('icon ') === -1 ) {
        icon = `icon ${  icon }`;
      }
    }

    return icon;
  }),

  stateColor: computed('relevantState', 'isError', function() {
    if ( get(this, 'isError') ) {
      return 'text-error';
    }

    var map = this.constructor.stateMap;
    var key = (get(this, 'relevantState') || '').toLowerCase();

    if ( map && map[key] && map[key].color !== undefined ) {
      if ( typeof map[key].color === 'function' ) {
        return map[key].color(this);
      } else {
        return map[key].color;
      }
    }

    if ( defaultStateMap[key] && defaultStateMap[key].color ) {
      let tmp = defaultStateMap[key].color;

      if ( typeof tmp === 'function' ) {
        return tmp(this);
      } else {
        return tmp;
      }
    }

    return this.constructor.defaultStateColor;
  }),

  sortState: computed('stateColor', 'relevantState', function() {
    var color = get(this, 'stateColor').replace('text-', '');

    return `${ stateColorSortMap[color] || stateColorSortMap['other']  } ${  get(this, 'relevantState') }`;
  }),

  stateBackground: computed('stateColor', function() {
    return get(this, 'stateColor').replace('text-', 'bg-');
  }),

  cloneForNew() {
    var copy = this.clone();

    delete copy.actionLinks;
    delete copy.appId;
    delete copy.id;
    delete copy.links;
    delete copy.name;
    delete copy.uuid;

    return copy;
  },

  serializeForNew() {
    var copy = this.serialize();

    delete copy.id;
    delete copy.actionLinks;
    delete copy.links;
    delete copy.uuid;

    return copy;
  },

  // Show growls for errors on actions
  delete(/* arguments*/) {
    var promise = this._super.apply(this, arguments);

    return promise.catch((err) => {
      get(this, 'growl').fromError('Error deleting', err);
    });
  },

  doAction(name, data, opt) {
    var promise = this._super.apply(this, arguments);

    if ( !opt || opt.catchGrowl !== false ) {
      return promise.catch((err) => {
        get(this, 'growl').fromError(`${ ucFirst(name)  } Error`, err);

        return reject(err);
      });
    }

    return promise;
  },

  // You really shouldn't have to use any of these.
  // Needing these is a sign that the API is bad and should feel bad.
  // Yet here they are, nonetheless.
  waitInterval: 1000,
  waitTimeout:  30000,
  _waitForTestFn(testFn, msg) {
    return new EmberPromise((resolve, reject) => {
      // Do a first check immediately
      if ( testFn.apply(this) ) {
        resolve(this);

        return;
      }

      var timeout = setTimeout(() =>  {
        clearInterval(interval);
        clearTimeout(timeout);
        reject(`Failed while: ${ msg }`);
      }, get(this, 'waitTimeout'));

      var interval = setInterval(() => {
        if ( testFn.apply(this) ) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(this);
        }
      }, get(this, 'waitInterval'));
    }, msg || 'Wait for it...');
  },

  waitForState(state) {
    return this._waitForTestFn(function() {
      return get(this, 'state') === state;
    }, `Wait for state=${ state }`);
  },

  waitForTransition() {
    return this._waitForTestFn(function() {
      return get(this, 'transitioning') !== 'yes';
    }, 'Wait for transition');
  },

  waitForAction(name) {
    return this._waitForTestFn(function() {
      // console.log('waitForAction('+name+'):', this.hasAction(name));
      return this.hasAction(name);
    }, `Wait for action=${ name }`);
  },

  hasCondition(condition, status = 'True') {
    let entry = (get(this, 'conditions') || []).findBy('type', condition);

    if ( !entry ) {
      return false;
    }

    if ( status ) {
      return ( get(entry, 'status') || '').toLowerCase() === (`${ status }`).toLowerCase();
    } else {
      return true;
    }
  },

  waitForCondition(condition, status = 'True') {
    return this._waitForTestFn(function() {
      return this.hasCondition(condition, status);
    }, `Wait for Condition: ${ condition }: ${ status }`);
  },

  displayUserLabelStrings: computed('labels', function() {
    let out = [];
    let labels = get(this, 'labels') || {};

    Object.keys(labels).forEach((key) => {
      if ( key.indexOf(C.LABEL.AFFINITY_PREFIX) === 0 ||
           key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 ||
          C.LABELS_TO_IGNORE.indexOf(key) >= 0
      ) {
        // Skip ignored labels
        return;
      } else {
        for ( let i = 0 ; i < C.LABEL_PREFIX_TO_IGNORE.length ; i++ ) {
          if ( key.startsWith(C.LABEL_PREFIX_TO_IGNORE[i]) ) {
            return;
          }
        }
      }

      out.push(key + (labels[key] ? `=${ labels[key] }` : ''));
    });

    return out;
  }),

  displayTaintsStrings: computed('nodeTaints', 'taints', function() {
    const out = [];
    const taints = get(this, 'nodeTaints') || get(this, 'taints') || [];

    taints.forEach((taint) => {
      out.push(`${ get(taint, 'key') }${ get(taint, 'value') ? `=${ get(taint, 'value')  }` : '' }:${ get(taint, 'effect') }`);
    });

    return out.sort();
  }),
});
