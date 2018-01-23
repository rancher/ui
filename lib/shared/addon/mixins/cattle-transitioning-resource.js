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
  'provisioning':             {icon: 'icon icon-circle',        color: 'text-info'   },
  'pending':                  {icon: 'icon icon-tag',           color: 'text-info'   },
  'purged':                   {icon: 'icon icon-purged',        color: 'text-error'  },
  'purging':                  {icon: 'icon icon-purged',        color: 'text-info'   },
  'reconnecting':             {icon: 'icon icon-alert',         color: 'text-error'  },
  'registering':              {icon: 'icon icon-tag',           color: 'text-info'   },
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
    promptDelete: function() {
      this.get('modalService').toggleModal('confirm-delete', {resources: [this]});
    },

    delete: function() {
      return this.delete();
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    goToApi: function() {
      let url      = this.get('links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
//      let endpoint = this.get('endpointSvc.absolute'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
//      url          = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);

      window.open(url, '_blank');
    },
  },

  displayName: function() {
    return this.get('name') || '('+this.get('id')+')';
  }.property('name','id'),

  sortName: function() {
    return sortableNumericSuffix(this.get('displayName').toLowerCase());
  }.property('displayName'),

  isTransitioning: equal('transitioning','yes'),
  isError: equal('transitioning','error'),
  isRemoved: computed('state', () => { return !C.REMOVEDISH_STATES.includes(this.state); }),
  isPurged: equal('state','purged'),
  isActive: equal('state','active'),

  relevantState: function() {
    return this.get('combinedState') || this.get('state') || 'unknown';
  }.property('combinedState','state'),

  displayState: alias('_displayState'),
  _displayState: function() {
    var state = this.get('relevantState')||'';
    return state.split(/-/).map((word) => {
      return ucFirst(word);
    }).join('-');
  }.property('relevantState'),

  showTransitioningMessage: function() {
    var trans = this.get('transitioning');
    if (trans === 'yes' || trans === 'error') {
      let message = (this.get('transitioningMessage')||'');
      if ( message.length && message.toLowerCase() !== this.get('displayState').toLowerCase() ) {
        return true;
      }
    }

    return false;
  }.property('transitioning','transitioningMessage','displayState'),

  stateIcon: function() {
    var trans = this.get('transitioning');
    var icon = '';
    if ( trans === 'yes' )
    {
      icon = 'icon icon-spinner icon-spin';
    }
    else if ( trans === 'error' )
    {
      icon = 'icon icon-alert';
    }
    else
    {
      var map = this.constructor.stateMap;
      var key = (this.get('relevantState')||'').toLowerCase();
      if ( map && map[key] && map[key].icon !== undefined)
      {
        if ( typeof map[key].icon === 'function' )
        {
          icon = map[key].icon(this);
        }
        else
        {
          icon = map[key].icon;
        }
      }

      if ( !icon && defaultStateMap[key] && defaultStateMap[key].icon )
      {
        icon = defaultStateMap[key].icon;
      }

      if ( !icon )
      {
        icon = this.constructor.defaultStateIcon;
      }

      if ( icon.indexOf('icon ') === -1 )
      {
        icon = 'icon ' + icon;
      }
    }

    return icon;
  }.property('relevantState','transitioning'),

  stateColor: function() {
    if ( this.get('isError') ) {
      return 'text-error';
    }

    var map = this.constructor.stateMap;
    var key = (this.get('relevantState')||'').toLowerCase();
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
  }.property('relevantState','isError'),

  sortState: function() {
    var color = this.get('stateColor').replace('text-','');
    return (stateColorSortMap[color] || stateColorSortMap['other']) + ' ' + this.get('relevantState');
  }.property('stateColor','relevantState'),

  stateBackground: function() {
    return this.get('stateColor').replace("text-","bg-");
  }.property('stateColor'),

  cloneForNew: function() {
    var copy = this.clone();
    delete copy.id;
    delete copy.actionLinks;
    delete copy.links;
    delete copy.uuid;
    return copy;
  },

  serializeForNew: function() {
    var copy = this.serialize();
    delete copy.id;
    delete copy.actionLinks;
    delete copy.links;
    delete copy.uuid;
    return copy;
  },

  // Show growls for errors on actions
  delete: function(/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.catch((err) => {
      this.get('growl').fromError('Error deleting',err);
    });
  },

  doAction: function(name, data, opt) {
    var promise = this._super.apply(this, arguments);

    if ( !opt || opt.catchGrowl !== false )
    {
      return promise.catch((err) => {
        this.get('growl').fromError(ucFirst(name) + ' Error', err);
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
  _waitForTestFn: function(testFn, msg) {
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
      }, this.get('waitTimeout'));

      var interval = setInterval(() => {
        if ( testFn.apply(this) )
        {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(this);
        }
      }, this.get('waitInterval'));
    }, msg||'Wait for it...');
  },

  waitForState: function(state) {
    return this._waitForTestFn(function() {
      return this.get('state') === state;
    }, 'Wait for state='+state);
  },

  waitForTransition: function() {
    return this._waitForTestFn(function() {
      return this.get('transitioning') !== 'yes';
    }, 'Wait for transition');
  },

  waitForAction: function(name) {
    return this._waitForTestFn(function() {
      //console.log('waitForAction('+name+'):', this.hasAction(name));
      return this.hasAction(name);
    }, 'Wait for action='+name);
  },

  waitForCondition: function(condition, status='True') {
    return this._waitForTestFn(function() {
      let cMap = (this.get('conditions')||[]).findBy('type', condition);

      if (cMap) {
        return ( get(cMap,'status')||'').toLowerCase() === (status+'').toLowerCase();
      }

      return false;
    }, `Wait for Condition: ${condition}: ${status}`);
  },

  displayUserLabelStrings: function() {
    let out = [];
    let labels = this.get('labels')||{};
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
  }.property('labels'),
});
