import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.custom');
  },

  model: function() {
    var self = this;
    return self.get('store').find('registrationToken',null,{forceReload: true}).then(function(tokens) {
      if ( tokens.get('length') === 0 )
      {
        // There should always be one already, but if there isn't go create one...
        return self.get('store').createRecord({
          type: 'registrationToken'
        }).save();
      }
      else
      {
        return tokens.get('firstObject');
      }
    });
  },

  renderTemplate: function() {
    this.render({into: 'hosts/new'});
  },
});
