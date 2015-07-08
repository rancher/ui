import Ember from 'ember';
import ApiError from 'ember-api-store/models/error';
import Resource from 'ember-api-store/models/resource';

export default Ember.Mixin.create({
  originalModel: null,
  errors: null,
  saving: false,
  editing: true,
  primaryResource: Ember.computed.alias('model'),
  originalPrimaryResource: Ember.computed.alias('originalModel'),

  didInitAttrs: function() {
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
          this.send('apiValidationError',err);
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

    apiValidationError: function(err) {
      var str = 'Validation failed in API:';
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
      var original = this.get('originalPrimaryResource');
      if ( original )
      {
        if ( Resource.detectInstance(original) )
        {
          original.merge(newData);
        }
      }
    });
  },

  // didSave can be used to do additional saving of dependent resources
  didSave: function() {
  },

  // doneSaving happens after didSave
  doneSaving: function() {
    return this.get('originalPrimaryResource') || this.get('model');
  },

  // errorSaving can be used to do additional cleanup of dependent resources on failure
  errorSaving: function(/*err*/) {
  },
});
