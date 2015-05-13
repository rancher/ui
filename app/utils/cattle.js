import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

function modelProxy(methodName) {
  return function(/*arguments*/) {
    var model = this.get('model');
    return model[methodName].apply(model,arguments);
  };
}

var ResourceController = Ember.ObjectController.extend({
  needs: ['application','authenticated'],
  actions: {
    goToApi: function() {
      var url = this.get('links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      var endpoint = this.get('controllers.application.absoluteEndpoint'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
      url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);

      // Go to the project-specific version
      var projectId = this.get('session').get(C.SESSION.PROJECT);
      if ( projectId )
      {
        url = url.replace(/(.*?\/v1)(.*)/,"$1/projects/"+projectId+"$2");
      }

      url = Util.addAuthorization(url, C.HEADER.AUTH_FAKE_USER, this.get('session.'+C.SESSION.TOKEN)||'');

      window.open(url, '_blank');
    },
  },

  displayName: function() {
    return this.get('name') || '('+this.get('id')+')';
  }.property('name','id'),

  isDeleted: Ember.computed.equal('state','removed'),
  isPurged: Ember.computed.equal('state','purged'),

  hasAction:  modelProxy('hasAction'),
  doAction:   modelProxy('doAction'),
  linkFor:    modelProxy('linkFor'),
  hasLink:    modelProxy('hasLink'),
  importLink: modelProxy('importLink'),
  followLink: modelProxy('followLink'),
  save:       modelProxy('save'),
  delete:     modelProxy('delete'),
  reload:     modelProxy('reload'),
  isInStore:  modelProxy('isInStore'),

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

});

var CollectionController = Ember.ArrayController.extend({
  sortProperties: ['name','id'],
});

var NewOrEditMixin = Ember.Mixin.create({
  originalModel: null,
  errors: null,
  saving: false,
  editing: true,
  primaryResource: Ember.computed.alias('model'),

  initFields: function() {
    this._super();
    this.set('errors',null);
    this.set('saving',false);
  },

  validate: function() {
    var model = this.get('primaryResource');
    var errors = model.validationErrors();
    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }

    this.set('errors', null);
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

          this.set('errors', [str]);
        }
      }
      else if (err)
      {
        this.set('errors', [err]);
      }
      else
      {
        this.set('errors', null);
      }
    },

    validationError: function(err) {
      var str = 'Validation failed:';
      var something = false;
      if ( err.get('fieldName') )
      {
        str += ' ' + err.get('fieldName');
        something = true;
      }

      if ( err.get('detail') )
      {
        str += ' (' + err.get('detail') + ')';
        something = true;
      }

      if ( !something )
      {
        str += ' (' + err.get('code') + ')';
      }

      this.set('errors', [str]);
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
        self.errorSaving(err);
      }).finally(function() {
        self.set('saving',false);
      });
    }
  },

  // willSave happens before save and can stop the save from happening
  willSave: function() {
    this.set('errors',null);
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

  // errorSaving cna be used to do additional cleanup of dependent resources on failure
  errorSaving: function(/*err*/) {
  },
});

// Cattle resources that transition have these
var TransitioningResource = Resource.extend({
  reservedKeys: ['delayTimer','pollTimer','waitInterval','waitTimeout'],

  state: null,
  transitioning: null,
  transitioningMessage: null,
  transitioningProgress: null,
  isTransitioning: Ember.computed.equal('transitioning','yes'),
  isError: Ember.computed.equal('transitioning','error'),

  replaceWith: function() {
    //console.log('1 replaceWith', this.get('id'));
    this._super.apply(this,arguments);
    this.transitioningChanged();
  },

  wasAdded: function() {
    this.transitioningChanged();
  },

  wasRemoved: function() {
    this.transitioningChanged();
  },

  delayTimer: null,
  clearDelay: function() {
    clearTimeout(this.get('delayTimer'));
    this.set('delayTimer', null);
  },

  pollTimer: null,
  clearPoll: function() {
    clearTimeout(this.get('pollTimer'));
    this.set('pollTimer', null);
  },

  transitioningChanged: function() {
    var delay = this.constructor.pollTransitioningDelay;
    var interval = this.constructor.pollTransitioningInterval;

    // This resource doesn't want polling
    if ( !delay || !interval )
    {
      //console.log('return 1', this.toString());
      return;
    }

    // This resource isn't transitioning or isn't in the store
    if ( this.get('transitioning') !== 'yes' || !this.isInStore() )
    {
      //console.log('return 2', this.toString());
      this.clearPoll();
      this.clearDelay();
      return;
    }

    // We're already polling or waiting, just let that one finish
    if ( this.get('delayTimer') )
    {
      //console.log('return 3', this.toString());
      return;
    }

    //console.log('Transitioning poll', this.toString());

    this.set('delayTimer', setTimeout(function() {
      //console.log('1 expired', this.toString());
      this.transitioningPoll();
    }.bind(this), Util.timerFuzz(delay)));
  }.observes('transitioning'),

  transitioningPoll: function() {
    //console.log('Maybe polling', this.toString(), this.get('transitioning'), this.isInStore());
    this.clearPoll();

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
          //console.log('2 expired', this.toString());
          this.transitioningPoll();
        }.bind(this), Util.timerFuzz(this.constructor.pollTransitioningInterval)));
      }
      else
      {
        // If not transitioning anymore, stop polling
        this.clearPoll();
        this.clearDelay();
      }
    }).catch(() => {
      // If reloading fails, stop polling
      this.clearPoll();
      // but leave delay set so that it doesn't restart, (don't clearDelay())
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
