import Ember from 'ember';

export default Ember.Controller.extend({
  errors: null,
  editing: false,
  saving: false,

  actions: {
    addHost: function() {
      this.get('hostsArray').pushObject({value: null});
    },

    removeHost: function(obj) {
      this.get('hostsArray').removeObject(obj);
    },

    save: function() {
      this.set('errors', null);
      this.set('saving',true);
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
        if ( err.status === 422 && err.code === 'NotUnique' )
        {
          if ( this.get('hostsArray.length') > 1 )
          {
            this.set('errors',['This load balancer is already on one or more of the specified hosts']);
          }
          else
          {
            this.set('errors',['This load balancer is already on the specified host']);
          }
        }
        else
        {
          this.set('errors', [err]);
        }
      }).finally(() => {
        this.set('saving', false);
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
