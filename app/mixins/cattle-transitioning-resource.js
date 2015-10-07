import Ember from 'ember';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import { normalizeType } from 'ember-api-store/utils/normalize';
import C from 'ui/utils/constants';

const defaultStateMap = {
  'activating':       {icon: 'icon icon-tag',            color: 'text-info'   },
  'active':           {icon: 'icon icon-circle-o',       color: 'text-success'},
  'created':          {icon: 'icon icon-tag',            color: 'text-info'   },
  'creating':         {icon: 'icon icon-tag',            color: 'text-info'   },
  'deactivating':     {icon: 'icon icon-adjust',         color: 'text-info'   },
  'degraded':         {icon: 'icon icon-notification',   color: 'text-warning'},
  'error':            {icon: 'icon icon-alert',          color: 'text-danger' },
  'inactive':         {icon: 'icon icon-circle',         color: 'text-danger' },
  'initializing':     {icon: 'icon icon-notification',   color: 'text-warning'},
  'purged':           {icon: 'icon icon-tornado',        color: 'text-danger' },
  'purging':          {icon: 'icon icon-tornado',        color: 'text-info'   },
  'removed':          {icon: 'icon icon-trash',          color: 'text-danger' },
  'removing':         {icon: 'icon icon-trash',          color: 'text-info'   },
  'requested':        {icon: 'icon icon-tag',            color: 'text-info'   },
  'registering':      {icon: 'icon icon-tag',            color: 'text-info'   },
  'restoring':        {icon: 'icon icon-medicalcross',   color: 'text-info'   },
  'running':          {icon: 'icon icon-circle-o',       color: 'text-success'},
  'starting':         {icon: 'icon icon-adjust',         color: 'text-info'   },
  'stopped':          {icon: 'icon icon-circle',         color: 'text-danger' },
  'stopping':         {icon: 'icon icon-adjust',         color: 'text-info'   },
  'unhealthy':        {icon: 'icon icon-notification',   color: 'text-danger' },
  'updating':         {icon: 'icon icon-tag',            color: 'text-info'   },
  'updating-active':  {icon: 'icon icon-tag',            color: 'text-info'   },
  'updating-inactive':{icon: 'icon icon-tag',            color: 'text-info'   },
};

export default Ember.Mixin.create({
  endpoint: Ember.inject.service(),
  cookies: Ember.inject.service(),
  growl: Ember.inject.service(),

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
      this.get('application').set('confirmDeleteResources', [ this.get('model') ] );
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
      var url = this.get('model.links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      var endpoint = this.get('endpoint.absolute'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
      url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);

      // Go to the project-specific version
      var projectId = this.get('session').get(C.SESSION.PROJECT);
      if ( projectId && this.get('model.type') !== 'account' )
      {
        url = url.replace(/(.*?\/v1)(.*)/,"$1/projects/"+projectId+"$2");
      }

      // For local development where API doesn't match origin, add basic auth token
      if ( url.indexOf(window.location.origin) !== 0 )
      {
        var token = this.get('cookies').get(C.COOKIE.TOKEN);
        if ( token )
        {
          url = Util.addAuthorization(url, C.USER.BASIC_BEARER, token);
        }
      }

      window.open(url, '_blank');
    },
  },

  displayName: function() {
    return this.get('name') || '('+this.get('id')+')';
  }.property('name','id'),

  isTransitioning: Ember.computed.equal('transitioning','yes'),
  isError: Ember.computed.equal('transitioning','error'),
  isDeleted: Ember.computed.equal('state','removed'),
  isPurged: Ember.computed.equal('state','purged'),

  displayState: function() {
    var state = this.get('state')||'';
    return state.split(/-/).map((word) => {
      return Util.ucFirst(word);
    }).join('-');
  }.property('state'),

  showTransitioningMessage: function() {
    var trans = this.get('transitioning');
    return (trans === 'yes' || trans === 'error') && (this.get('transitioningMessage')||'').length > 0;
  }.property('transitioning','transitioningMessage'),

  stateIcon: function() {
    var trans = this.get('transitioning');
    if ( trans === 'yes' )
    {
      return 'icon icon-spinner icon-spin';
    }
    else if ( trans === 'error' )
    {
      return 'icon icon-alert text-danger';
    }
    else
    {
      var map = this.constructor.stateMap;
      var key = (this.get('state')||'').toLowerCase();
      if ( map && map[key] && map[key].icon !== undefined)
      {
        if ( typeof map[key].icon === 'function' )
        {
          return map[key].icon(this);
        }
        else
        {
          return map[key].icon;
        }
      }

      if ( defaultStateMap[key] && defaultStateMap[key].icon )
      {
        return defaultStateMap[key].icon;
      }

      return this.constructor.defaultStateIcon;
    }
  }.property('state','transitioning'),

  stateColor: function() {
      var map = this.constructor.stateMap;
      var key = (this.get('state')||'').toLowerCase();
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
  }.property('state','transitioning'),

  stateBackground: function() {
    return this.get('stateColor').replace("text-","bg-");
  }.property('stateColor'),

  trimValues: function(depth, seenObjs) {
    if ( !depth )
    {
      depth = 0;
    }

    if ( !seenObjs )
    {
      seenObjs = [];
    }
    this.eachKeys((val,key) => {
      Ember.set(this, key, recurse(val,depth));
    }, false);

    return this;

    function recurse(val, depth) {
      if ( depth > 10 )
      {
        console.log(val);
        return val;
      }
      else if ( typeof val === 'string' )
      {
        return val.trim();
      }
      else if ( Ember.isArray(val) )
      {
        val.beginPropertyChanges();
        val.forEach((v, idx) => {
          var out = recurse(v, depth+1);
          if ( val.objectAt(idx) !== out )
          {
            val.replace(idx, 1, out);
          }
        });
        val.endPropertyChanges();
        return val;
      }
      else if ( Resource.detectInstance(val) )
      {
        // Don't include a resource we've already seen in the chain
        if ( seenObjs.indexOf(val) > 0 ) {
          return null;
        }

        seenObjs.pushObject(val);
        return val.trimValues(depth+1, seenObjs);
      }
      else if ( val && typeof val === 'object' )
      {
        Object.keys(val).forEach(function(key) {
          // Skip keys with dots in them, like container labels
          if ( key.indexOf('.') === -1 )
          {
            Ember.set(val, key, recurse(val[key], depth+1));
          }
        });
        return val;
      }
      else
      {
        return val;
      }
    }
  },

  validationErrors: function() {
    var errors = [];
    var type = this.get('type');
    if ( type )
    {
      type = normalizeType(this.get('type'));
    }
    else
    {
      console.warn('No type found to validate', this);
      return [];
    }

    var schema = this.get('store').getById('schema', type);
    if ( !schema )
    {
      console.warn('No schema found to validate', type, this);
      return [];
    }

    // Trim all the values to start so that empty strings become nulls
    this.trimValues();

    var fields = schema.resourceFields;
    var keys = Object.keys(fields);
    var field, key, val;
    var more;
    for ( var i = 0 ; i < keys.length ; i++ )
    {
      key = keys[i];
      field = fields[key];
      val = this.get(key);

      if ( val === undefined )
      {
        val = null;
      }

      if ( field.type.indexOf('[') >= 0 )
      {
        // array, map, reference
        // @todo
      }
      else if ( ['string','password','float','int','date','blob','boolean','enum'].indexOf(field.type) === -1 )
      {
        // embedded schema type
        if ( val && val.validationErrors )
        {
          more = val.validationErrors();
          errors.pushObjects(more);
        }
      }

      // Coerce strings to numbers
      if ( field.type === 'float' && typeof val === 'string' )
      {
        val = parseFloat(val) || null; // NaN becomes null
        this.set(key, val);
      }

      if ( field.type === 'int' && typeof val === 'string' && key !== 'id' ) // Sigh: ids are all marked int, rancherio/rancher#515
      {
        val = parseInt(val, 10) || null;
        this.set(key, val);
      }

      // Empty strings on nullable fields -> null
      if ( ['string','password','float','int','date','blob','enum'].indexOf(field.type) >= 0 )
      {
        if ( (typeof val === 'string' && !val) || val === null ) // empty/null strings or null numbers
        {
          if ( field.nullable )
          {
            val = null;
            this.set(key, val);
          }
        }
      }

      var len = (val ? Ember.get(val,'length') : 0);
      if ( field.required && (val === null || (typeof val === 'string' && len === 0) || (Ember.isArray(val) && len === 0) ) )
      {
        errors.push('"' + key + '" is required');
        continue;
      }

      var min, max;
      var desc = (field.type.indexOf('array[') === 0 ? 'item' : 'character');
      if ( val !== null )
      {
        // String and array length:
        min = field.minLength;
        max = field.maxLength;
        if ( min && max )
        {
          if ( (len < min) || (len > max) )
          {
            errors.push(key + ' should be ' + min + '-' + max + ' ' + desc + (min === 1 && max === 1 ? '' : 's') + ' long');
          }
        }
        else if ( min && (len < min) )
        {
          errors.push(key + ' should be at least ' + min + ' ' + desc + (min === 1 ? '' : 's') + ' long');
        }
        else if ( max && (len > max) )
        {
          errors.push(key + ' should be at most ' + max + ' ' + desc + (min === 1 ? '' : 's') + ' long');
        }

        // Number min/max
        min = field.min;
        max = field.max;
        if ( val !== null && min && max )
        {
          if ( (val < min) || (val > max) )
          {
            errors.push(key + ' should be between ' + min + ' and ' + max);
          }
        }
        else if ( min && (val < min) )
        {
          errors.push(key + ' should be at least ' + min + ' ' + desc);
        }
        else if ( max && (val > max) )
        {
          errors.push(key + ' should be at most ' + max + ' ' + desc);
        }

        var test = [];
        if ( field.validChars )
        {
          test.push('[^'+ field.validChars + ']');
        }

        if ( field.invalidChars )
        {
          test.push('['+ field.invalidChars + ']');
        }

        if ( test.length )
        {
          var regex = new RegExp('('+ test.join('|') + ')');
          var match = val.match(regex);
          if ( match )
          {
            errors.push(key + " contains invalid character: '" + match[1] + "'");
          }
        }
      }
    }

    return errors;
  },

  cloneForNew: function() {
    var copy = this.clone();
    delete copy.id;
    delete copy.actions;
    delete copy.links;
    delete copy.uuid;
    return copy;
  },

  serializeForNew: function() {
    var copy = this.serialize();
    delete copy.id;
    delete copy.actions;
    delete copy.links;
    delete copy.uuid;
    return copy;
  },

  // Show growls for errors on actions
  delete: function(/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.catch((err) => {
      this.get('growl').fromError('Delete Error',err);
    });
  },

  doAction: function(name, data, opt) {
    var promise = this._super.apply(this, arguments);

    if ( opt && opt.catchGrowl !== false )
    {
      return promise.catch((err) => {
        this.get('growl').fromError(Util.ucFirst(name) + ' Error', err);
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
    return new Ember.RSVP.Promise((resolve, reject) => {
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

  waitForNotTransitioning: function() {
    return this._waitForTestFn(function() {
      return this.get('transitioning') !== 'yes';
    }, 'Wait for not transitioning');
  },

  waitForAction: function(name) {
    return this._waitForTestFn(function() {
      //console.log('waitForAction('+name+'):', this.hasAction(name));
      return this.hasAction(name);
    }, 'Wait for action='+name);
  },

  waitForAndDoAction: function(name, data) {
    return this.waitForAction(name).then(() => {
      return this.doAction(name, data);
    }, 'Wait for and do action='+name);
  },
});
