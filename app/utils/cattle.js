import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import ApiError from 'ember-api-store/models/error';

var ResourceController = Ember.ObjectController.extend({
  needs: ['application'],
  actions: {
    goToApi: function() {
      var url = this.get('links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      var endpoint = this.get('controllers.application.absoluteEndpoint'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
      url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);
      window.open(url, '_blank');
    },
  },

  displayName: function() {
    return this.get('name') || '('+this.get('id')+')';
  }.property('name','id'),

  delete: function() {
    return this.get('model').delete();
  },

  isDeleted: Ember.computed.equal('state','removed'),
  isPurged: Ember.computed.equal('state','purged')
});

var CollectionController = Ember.ArrayController.extend({
  sortProperties: ['name','id'],
});

var NewOrEditMixin = Ember.Mixin.create({
  originalModel: null,
  error: null,
  saving: false,
  editing: true,
  primaryResource: Ember.computed.alias('model'),

  validate: function() {
    return true;
  },

  actions: {
    error: function(err) {
      if ( err instanceof ApiError )
      {
        if ( err.get('status') === 422 )
        {
          this.send('validationError',err);
        }
        else
        {
          var str = err.get('message');
          if ( err.get('detail') )
          {
            str += ' (' + err.get('detail') + ')';
          }

          this.set('error', str);
        }
      }
      else
      {
        console.log(err);
        this.set('error', err);
      }
    },

    validationError: function(err) {
      var str = 'Validation failed: ' + err.get('fieldName');

      if ( err.get('detail') )
      {
        str += ' (' + err.get('detail') + ')';
      }

      this.set('error', str);
    },

    save: function() {
      var self = this;

      if ( !this.willSave() )
      {
        // Validation or something else said not to save
        return;
      }

      this.doSave()
      .then(this.didSave.bind(this))
      .then(this.doneSaving.bind(this))
      .catch(function(err) {
        self.send('error', err);
      }).finally(function() {
        self.set('saving',false);
      });
    }
  },

  // willSave happens before save and can stop the save from happening
  willSave: function() {
    this.set('error',null);
    var ok = this.validate();
    if ( !ok )
    {
      // Validation failed
      return false;
    }

    if ( this.get('saving') )
    {
      // Already saving
      return false;
    }

    this.set('saving',true);
    return true;
  },

  doSave: function() {
    var model = this.get('primaryResource');
    return model.save().then((newData) => {
      var original = this.get('originalModel');
      if ( original )
      {
        original.merge(newData);
      }
    });
  },

  // didSave can be used to do additional saving of dependent resources
  didSave: function() {
  },

  // doneSaving happens after didSave
  doneSaving: function() {
    return this.get('originalModel') || this.get('model');
  },
});

// Cattle resources that transition have these
var TransitioningResource = Resource.extend({
  state: null,
  transitioning: null,
  transitioningMessage: null,
  transitioningProgress: null,
  isTransitioning: Ember.computed.equal('transitioning','yes'),
  isError: Ember.computed.equal('transitioning','error'),

  replaceWith: function() {
    this._super.apply(this,arguments);
    this.transitioningChanged();
  },

  pollDelayTimer: null,
  pollTimer: null,
  reservedKeys: ['pollDelayTimer','pollTimer','waitInterval','waitTimeout'],
  transitioningChanged: function() {
    //console.log('Transitioning changed', this.toString(), this.get('transitioning'), this.get('pollDelayTimer'),this.get('pollTimer'));

    clearTimeout(this.get('pollDelayTimer'));
    clearTimeout(this.get('pollTimer'));

    if ( !this.isInStore() )
    {
      //console.log('This resource is not in the store');
      return;
    }

    var delay = this.constructor.pollTransitioningDelay;
    var interval = this.constructor.pollTransitioningInterval;
    if ( delay > 0 && interval > 0 && this.get('transitioning') === 'yes' )
    {
      //console.log('Starting poll timer', this.toString());
      this.set('pollDelayTimer', setTimeout(function() {
        //console.log('1 expired');
        this.transitioningPoll();
      }.bind(this), delay));
    }
  }.observes('transitioning'),

  transitioningPoll: function() {
    clearTimeout(this.get('pollTimer'));

    //console.log('Checking', this.toString());

    if ( this.get('transitioning') !== 'yes' || !this.isInStore() )
    {
      return;
    }

    //console.log('Polling', this.toString());
    this.reload().then((/*newData*/) => {
      //console.log('Poll Finished', this.toString());
      if ( this.get('transitioning') === 'yes' )
      {
        //console.log('Rescheduling', this.toString());
        this.set('pollTimer', setTimeout(function() {
          //console.log('2 expired');
          this.transitioningPoll();
        }.bind(this), this.constructor.pollTransitioningInterval));
      }
    });
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
      console.log('waitForAction('+name+'):', this.hasAction(name));
      return this.hasAction(name);
    }, 'Wait for action='+name);
  },

  waitForAndDoAction: function(name, data) {
    return this.waitForAction(name).then(() => {
      return this.doAction(name, data);
    }, 'Wait for and do action='+name);
  },
});

TransitioningResource.reopenClass({
  pollTransitioningDelay: 30000,
  pollTransitioningInterval: 30000,
});

var TransitioningResourceController = ResourceController.extend({
  actions: {
    // Common actions that almost all types have in common...
    promptDelete: function() {
      this.send('openOverlay', 'confirm-delete', 'confirm-delete', this.get('model'), this);
    },

    confirmDelete: function() {
      this.send('delete');
      this.send('closeOverlay');
    },

    cancelDelete: function() {
      this.send('closeOverlay');
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

  },
  displayState: function() {
    var state = this.get('state')||'';
    return state.substr(0,1).toUpperCase() + state.substr(1);
  }.property('state'),

  showTransitioningMessage: function() {
    var trans = this.get('transitioning');
    return (trans === 'yes' || trans === 'error') && (this.get('transitioningMessage')||'').length > 0;
  }.property('transitioning','transitioningMessage'),

  stateIcon: function() {
    var trans = this.get('transitioning');
    if ( trans === 'yes' )
    {
      return 'fa fa-circle-o-notch fa-spin';
    }
    else if ( trans === 'error' )
    {
      return 'ss-alert text-danger';
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

    return this.constructor.defaultStateColor;
  }.property('state','transitioning'),

  stateBackground: function() {
    return this.get('stateColor').replace("text-","bg-");
  }.property('stateColor'),


  doAction: function(/*arguments*/) {
    var model = this.get('model');
    return model.doAction.apply(model,arguments);
  },

  availableActions: function() {
    /*
      Override me and return [
        {
          enabled: true/false,    // Whether it's enabled or greyed out
          detail: true/false,     // If true, this action will only be shown on detailed screens
          label: 'Delete',        // Label shown on hover or in menu
          icon: 'fa-trash-o',     // Icon shown on screen
          action: 'promptDelete', // Action to call on the controller when clicked
          altAction: 'delete'     // Action to call on the controller when alt+clicked
          divider: true,          // Just this will make a divider
        },
        ...
      ]
    */

    return [];
  },

  hasProgress: function() {
    var progress = this.get('transitioningProgress');
    return progress && !isNaN(progress) && progress >= 0;
  }.property('transitioningProgress'),

  displayProgress: function() {
    var progress = this.get('transitioningProgress');
    if ( isNaN(progress) || !progress )
    {
      progress = 100;
    }

    return Math.max(2,Math.min(progress, 100));
  }.property('transitioningProgress'),

  progressStyle: function() {
    return 'width: '+ this.get('displayProgress') +'%';
  }.property('displayProgress'),

});

// Override stateMap with a map of state -> icon classes
TransitioningResourceController.reopenClass({
  stateMap: null,
  defaultStateIcon: 'fa fa-question-circle',
  defaultStateColor: ''
});

export default {
  ResourceController: ResourceController,
  CollectionController: CollectionController,
  NewOrEditMixin: NewOrEditMixin,
  TransitioningResource: TransitioningResource,
  TransitioningResourceController: TransitioningResourceController,
};
