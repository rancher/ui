import { reject, Promise as EmberPromise } from 'rsvp';
import { computed, get } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { ucFirst, sortableNumericSuffix } from 'ui/utils/util';
import C from 'ui/utils/constants';

const defaultStateMap = {
  'activating':               {icon: 'icon icon-tag',           color: 'text-info'   },
  'active':                   {icon: 'icon icon-circle-o',      color: 'text-success'},
  'available':                {icon: 'icon icon-circle-o',      color: 'text-success'},
  'bound':                    {icon: 'icon icon-circle',        color: 'text-success'},
  'backedup':                 {icon: 'icon icon-backup',        color: 'text-success'},
  'created':                  {icon: 'icon icon-tag',           color: 'text-info'   },
  'creating':                 {icon: 'icon icon-tag',           color: 'text-info'   },
  'deactivating':             {icon: 'icon icon-adjust',        color: 'text-info'   },
  'degraded':                 {icon: 'icon icon-alert',         color: 'text-warning'},
  'disconnected':             {icon: 'icon icon-alert',         color: 'text-warning'},
  'error':                    {icon: 'icon icon-alert',         color: 'text-error'  },
  'erroring':                 {icon: 'icon icon-alert',         color: 'text-error'  },
  'expired':                  {icon: 'icon icon-alert',         color: 'text-warning'},
  'healthy':                  {icon: 'icon icon-circle-o',      color: 'text-success'},
  'inactive':                 {icon: 'icon icon-circle',        color: 'text-error'  },
  'initializing':             {icon: 'icon icon-alert',         color: 'text-warning'},
  'migrating':                {icon: 'icon icon-info',          color: 'text-info'   },
  'paused':                   {icon: 'icon icon-info',          color: 'text-info'   },
  'provisioning':             {icon: 'icon icon-circle',        color: 'text-info'   },
  'pending':                  {icon: 'icon icon-tag',           color: 'text-info'   },
  'purged':                   {icon: 'icon icon-purged',        color: 'text-error'  },
  'purging':                  {icon: 'icon icon-purged',        color: 'text-info'   },
  'reconnecting':             {icon: 'icon icon-alert',         color: 'text-error'  },
  'registering':              {icon: 'icon icon-tag',           color: 'text-info'   },
  'released':                 {icon: 'icon icon-alert',         color: 'text-warning'},
  'reinitializing':           {icon: 'icon icon-alert',         color: 'text-warning'},
  'removed':                  {icon: 'icon icon-trash',         color: 'text-error'  },
  'removing':                 {icon: 'icon icon-trash',         color: 'text-info'   },
  'requested':                {icon: 'icon icon-tag',           color: 'text-info'   },
  'restarting':               {icon: 'icon icon-adjust',        color: 'text-info'   },
  'restoring':                {icon: 'icon icon-medicalcross',  color: 'text-info'   },
  'running':                  {icon: 'icon icon-circle-o',      color: 'text-success'},
  'starting':                 {icon: 'icon icon-adjust',        color: 'text-info'   },
  'stopped':                  {icon: 'icon icon-circle',        color: 'text-error'  },
  'stopping':                 {icon: 'icon icon-adjust',        color: 'text-info'   },
  'unavailable':              {icon: 'icon icon-alert',         color: 'text-error'  },
  'unhealthy':                {icon: 'icon icon-alert',         color: 'text-error'  },
  'unknown':                  {icon: 'icon icon-help',          color: 'text-warning'},
  'updating':                 {icon: 'icon icon-tag',           color: 'text-info'   },
  'waiting':                  {icon: 'icon icon-tag',           color: 'text-info'   },
};

const stateColorSortMap = {
  'error':   1,
  'warning': 2,
  'info':    3,
  'success': 4,
  'other': 5,
};

export default Mixin.create({
  endpointSvc: service('endpoint'), // Some machine drivers have a property called 'endpoint'
  cookies: service(),
  growl: service(),
  intl: service(),

  modalService: service('modal'),
  reservedKeys: ['waitInterval','waitTimeout'],

  state: null,
  transitioning: null,
  transitioningMessage: null,
  transitioningProgress: null,

  availableActions: function() {
    /*
      Override me and return [
        {
          enabled: true/false,    // Whether it's enabled or greyed out
          detail: true/false,     // If true, this action will only be shown on detailed screens
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
  }.property(),

  actions: {
    promptDelete() {
      get(this,'modalService').toggleModal('confirm-delete', {resources: [this]});
    },

    delete() {
      return this.delete();
    },

    goToApi() {
      let url      = get(this,'links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      window.open(url, '_blank');
    },
  },

  displayName: computed('name','id', function() {
    return get(this,'name') || '('+get(this,'id')+')';
  }),

  sortName: computed('displayName', function() {
    return sortableNumericSuffix(get(this,'displayName').toLowerCase());
  }),

  isTransitioning: equal('transitioning','yes'),
  isError: equal('transitioning','error'),
  isActive: equal('state','active'),

  relevantState: computed('combinedState','state', function() {
    return get(this,'combinedState') || get(this,'state') || 'unknown';
  }),

  // This is like this so you can override the displayed state calculation
  displayState: alias('_displayState'),
  _displayState: computed('relevantState', function() {
    var state = get(this,'relevantState')||'';
    return state.split(/-/).map((word) => {
      return ucFirst(word);
    }).join('-');
  }),

  showTransitioningMessage: computed('transitioning','transitioningMessage','displayState', function() {
    var trans = get(this,'transitioning');
    if (trans === 'yes' || trans === 'error') {
      let message = (get(this,'transitioningMessage')||'');
      if ( message.length && message.toLowerCase() !== get(this,'displayState').toLowerCase() ) {
        return true;
      }
    }

    return false;
  }),

  stateIcon: computed('relevantState','transitioning', function() {
    var trans = get(this,'transitioning');
    var icon = '';

    if ( trans === 'yes' ) {
      icon = 'icon icon-spinner icon-spin';
    } else if ( trans === 'error' ) {
      icon = 'icon icon-alert';
    } else{
      var map = this.constructor.stateMap;
      var key = (get(this,'relevantState')||'').toLowerCase();
      if ( map && map[key] && map[key].icon !== undefined) {
        if ( typeof map[key].icon === 'function' ) {
          icon = map[key].icon(this);
        } else {
          icon = map[key].icon;
        }
      }

      if ( !icon && defaultStateMap[key] && defaultStateMap[key].icon ) {
        icon = defaultStateMap[key].icon;
      }

      if ( !icon ) {
        icon = this.constructor.defaultStateIcon;
      }

      if ( icon.indexOf('icon ') === -1 ) {
        icon = 'icon ' + icon;
      }
    }

    return icon;
  }),

  stateColor: computed('relevantState','isError', function() {
    if ( get(this,'isError') ) {
      return 'text-error';
    }

    var map = this.constructor.stateMap;
    var key = (get(this,'relevantState')||'').toLowerCase();
    if ( map && map[key] && map[key].color !== undefined )
    {
      if ( typeof map[key].color === 'function' )
      {
        return map[key].color(this);
      }
      else
      {
        return map[key].color;
      }
    }

    if ( defaultStateMap[key] && defaultStateMap[key].color )
    {
      return defaultStateMap[key].color;
    }

    return this.constructor.defaultStateColor;
  }),

  sortState: computed('stateColor','relevantState', function() {
    var color = get(this,'stateColor').replace('text-','');
    return (stateColorSortMap[color] || stateColorSortMap['other']) + ' ' + get(this,'relevantState');
  }),

  stateBackground: computed('stateColor', function() {
    return get(this,'stateColor').replace("text-","bg-");
  }),

  cloneForNew() {
    var copy = this.clone();
    delete copy.id;
    delete copy.actionLinks;
    delete copy.links;
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
  delete(/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.catch((err) => {
      get(this,'growl').fromError('Error deleting',err);
    });
  },

  doAction(name, data, opt) {
    var promise = this._super.apply(this, arguments);

    if ( !opt || opt.catchGrowl !== false )
    {
      return promise.catch((err) => {
        get(this,'growl').fromError(ucFirst(name) + ' Error', err);
        return reject(err);
      });
    }

    return promise;
  },

  // You really shouldn't have to use any of these.
  // Needing these is a sign that the API is bad and should feel bad.
  // Yet here they are, nonetheless.
  waitInterval: 1000,
  waitTimeout: 30000,
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
        reject(this);
      }, get(this,'waitTimeout'));

      var interval = setInterval(() => {
        if ( testFn.apply(this) )
        {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(this);
        }
      }, get(this,'waitInterval'));
    }, msg||'Wait for it...');
  },

  waitForState(state) {
    return this._waitForTestFn(function() {
      return get(this,'state') === state;
    }, 'Wait for state='+state);
  },

  waitForTransition() {
    return this._waitForTestFn(function() {
      return get(this,'transitioning') !== 'yes';
    }, 'Wait for transition');
  },

  waitForAction(name) {
    return this._waitForTestFn(function() {
      //console.log('waitForAction('+name+'):', this.hasAction(name));
      return this.hasAction(name);
    }, 'Wait for action='+name);
  },

  hasCondition(condition, status='True') {
    let entry = (get(this,'conditions')||[]).findBy('type', condition);
    if ( !entry ) {
      return false;
    }

    if ( status ) {
      return ( get(entry,'status')||'').toLowerCase() === (status+'').toLowerCase();
    } else {
      return true;
    }
  },

  waitForCondition(condition, status='True') {
    return this._waitForTestFn(function() {
      return this.hasCondition(condition, status);
    }, `Wait for Condition: ${condition}: ${status}`);
  },

  displayUserLabelStrings: computed('labels', function() {
    let out = [];
    let labels = get(this,'labels')||{};
    Object.keys(labels).forEach(function(key) {
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

      out.push(key + (labels[key] ? '='+labels[key] : ''));
    });

    return out;
  }),
});
