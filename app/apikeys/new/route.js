import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var self = this;
    var cred = this.get('store').createRecord({type:'apikey'});

    return cred.save().then(function(/*newCred*/) {
      return cred;
    }).catch(function(err) {
      self.send('error', err);
    });
  },

  afterModel: function(model) {
    this.transitionTo('apikey.edit', model, {queryParams: {justCreated: true}});
  }
});
