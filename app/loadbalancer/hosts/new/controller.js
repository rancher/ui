import Ember from 'ember';

export default Ember.Controller.extend({
  errors: null,
  editing: false,

  actions: {
    addHost: function() {
      this.get('hostsArray').pushObject({value: null});
    },

    removeHost: function(obj) {
      this.get('hostsArray').removeObject(obj);
    },

    save: function() {
      var promises = [];
      var balancer = this.get('model');

      this.get('hostsArray').forEach((obj) => {
        var id = Ember.get(obj,'value');
        if ( id )
        {
          promises.push( balancer.doAction('addhost', {
            hostId: id
          }));
        }
      });

      return Ember.RSVP.all(promises,'Add multiple hosts').then(() => {
        this.send('cancel');
      }).catch((err) => {
        this.set('errors', [err]);
      });
    },
  },

  initFields: function() {
    this._super();
    this.set('hostsArray', []);
    this.send('addHost');
  },

  allHosts: null,
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  hostsArray: null,
});
