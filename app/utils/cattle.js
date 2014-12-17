import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import ApiError from 'ember-api-store/models/error';

var ResourceController = Ember.ObjectController.extend({
  actions: {
    goToApi: function() {
      var url = this.get('links.self');
      var endpoint = this.get('app.endpoint');
      url = url.replace(/https?:\/\/[^\/]+/,endpoint);
      window.open(url, '_blank');
    },
  },

  displayName: function() {
    return this.get('name') || this.get('id');
  }.property('name','id'),

  delete: function() {
    return this.get('model').delete();
  },

  isDeleted: Ember.computed.equal('state','removed'),
  isPurged: Ember.computed.equal('state','purged')
});

var CollectionController = Ember.ArrayController.extend({
  sortProperties: ['name','id'],
  dataSource: Ember.computed.alias('notPurged'),

  notPurged: function() {
    return this.get('arrangedContent').filter(function(item) {
      var state = (item.get('state')||'').toLowerCase();
      return state !== 'purged';
    });
  }.property('arrangedContent.@each.state')
});

var NewOrEditMixin = Ember.Mixin.create({
  originalModel: null,
  error: null,
  saving: false,
  editing: true,

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

      }
    },

    validationError: function(err) {
      this.set('error', 'Validation failed:', err.get('fieldName') + ' (' + err.get('detail') + ')');
    },

    save: function() {
      var self = this;

      this.set('error',null);
      var ok = this.validate();
      if ( !ok )
      {
        // Validation failed
        return;
      }

      if ( this.get('saving') )
      {
        // Already saving
        return;
      }

      this.set('saving',true);

      var model = this.get('model');

      return model.save().then(function(newData) {
        var original = self.get('originalModel');
        if ( original )
        {
          original.merge(newData);
        }
      })
      .then(this.didSave.bind(this))
      .then(this.doneSaving.bind(this))
      .catch(function(err) {
        self.send('error', err);
      }).finally(function() {
        self.set('saving',false);
      });
    }
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
});

var TransitioningResourceController = ResourceController.extend({
  displayState: function() {
    var state = this.get('state')||'';
    return state.substr(0,1).toUpperCase() + state.substr(1);
  }.property('state'),

  isError: Ember.computed.alias('transitioning','error'),

  showTransitioningMessage: function() {
    var trans = this.get('transitioning');
    return (trans === 'yes' || trans === 'error');
  }.property('transitioning'),

  stateIcon: function() {
    var trans = this.get('transitioning');
    if ( trans === 'yes' )
    {
      return 'fa-cog fa-spin';
    }
    else if ( trans === 'error' )
    {
      return 'fa-exclamation-circle text-danger';
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

  isTransitioning: Ember.computed.equal('transitioning','yes'),

  doAction: function(/*arguments*/) {
    var model = this.get('model');
    return model.doAction.apply(model,arguments);
  },

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
  defaultStateIcon: 'fa-question-circle',
  defaultStateColor: ''
});

export default {
  ResourceController: ResourceController,
  CollectionController: CollectionController,
  NewOrEditMixin: NewOrEditMixin,
  TransitioningResource: TransitioningResource,
  TransitioningResourceController: TransitioningResourceController,
};
