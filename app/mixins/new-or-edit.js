import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import Errors from 'ui/utils/errors';

export default Ember.Mixin.create({
  originalModel: null,
  errors: null,
  editing: true,
  primaryResource: Ember.computed.alias('model'),
  originalPrimaryResource: Ember.computed.alias('originalModel'),

  tagName: 'form', // This indirectly disables global navigation shortcut keys

  init: function() {
    this._super();
    this.set('errors',null);
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

  submit(event) {
    event.preventDefault();
    this.send('save');
  },

  actions: {
    error: function(err) {
      if (err)
      {
        var body = Errors.stringify(err);
        this.set('errors', [body]);
      }
      else
      {
        this.set('errors', null);
      }
    },

    save: function(cb) {
      // Will save can return true/false or a promise
      Ember.RSVP.resolve(this.willSave()).then((ok) => {
        if ( !ok )
        {
          // Validation or something else said not to save
          if ( cb )
          {
            cb();
          }
          return;
        }

        this.doSave()
        .then(this.didSave.bind(this))
        .then(this.doneSaving.bind(this))
        .catch((err) => {
          this.send('error', err);
          this.errorSaving(err);
        }).finally(() => {
          try {
            if ( cb )
            {
              cb();
            }
          }
          catch(e) {
          }
        });
      });
    }
  },

  // willSave happens before save and can stop the save from happening
  willSave: function() {
    this.set('errors',null);
    var ok = this.validate();
    return ok;
  },

  doSave: function(opt) {
    return this.get('primaryResource').save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },

  mergeResult: function(newData) {
    var original = this.get('originalPrimaryResource');
    if ( original )
    {
      if ( Resource.detectInstance(original) )
      {
        original.merge(newData);
        return original;
      }
    }

    return newData;
  },

  // didSave can be used to do additional saving of dependent resources
  didSave: function(neu) {
    return neu;
  },

  // doneSaving happens after didSave
  doneSaving: function(neu) {
    return neu || this.get('originalPrimaryResource') || this.get('primaryResource');
  },

  // errorSaving can be used to do additional cleanup of dependent resources on failure
  errorSaving: function(/*err*/) {
  },
});
