import Ember from 'ember';
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
  cookies: Ember.inject.service(),

  needs: ['application','authenticated'],
  actions: {
    goToApi: function() {
      var url = this.get('links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      var endpoint = this.get('controllers.application.absoluteEndpoint'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
      url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);

      // Go to the project-specific version
      var projectId = this.get('session').get(C.SESSION.PROJECT);
      if ( projectId && this.get('type').toLowerCase() !== 'account' )
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
          icon: 'icon icon-trash',// Icon shown on screen
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

var LegacyNewOrEditMixin = Ember.Mixin.create({
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

      switch ( err.get('code') )
      {
        case 'NotUnique':
          str += ' is not unique'; break;
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

var LegacyTransitioningResourceController = ResourceController.extend({
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
});

// Override stateMap with a map of state -> icon classes
LegacyTransitioningResourceController.reopenClass({
  stateMap: null,
  defaultStateIcon: 'icon icon-help',
  defaultStateColor: ''
});

export default {
  LegacyNewOrEditMixin: LegacyNewOrEditMixin,
  LegacyTransitioningResourceController: LegacyTransitioningResourceController,
};
