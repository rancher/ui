import Ember from 'ember';
import TargetChoices from 'ui/mixins/target-choices';

export default Ember.Controller.extend(TargetChoices, {
  error: null,
  editing: false,
  saving: false,

  actions: {
    addTargetContainer: function() {
      this.get('targetsArray').pushObject({isContainer: true, value: null});
    },
    addTargetIp: function() {
      this.get('targetsArray').pushObject({isIp: true, value: ''});
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },

    save: function() {
      this.set('saving',true);
      this.set('errors', null);
      var promises = [];
      var balancer = this.get('model');

      this.get('targetContainerIds').forEach((id) => {
        promises.push( balancer.doAction('addtarget', {
          instanceId: id,
        }));
      });

      this.get('targetIpAddresses').forEach((ip) => {
        promises.push( balancer.doAction('addtarget', {
          ipAddress: ip,
        }));
      });

      return Ember.RSVP.all(promises,'Add multiple targets').then(() => {
        this.send('cancel');
      }).catch((err) => {
        if ( err.status === 422 && err.code === 'NotUnique' )
        {
          if ( this.get('targetsArray.length') > 1 )
          {
            this.set('errors',['This load balancer is already has one or more of the specified targets']);
          }
          else
          {
            this.set('errors',['This load balancer already has the specified targets']);
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
    this.set('targetsArray', []);
  },

  allHosts: null,
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  targetsArray: null,

  targetContainerIds: function() {
    return this.get('targetsArray').filterProperty('isContainer',true).map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  targetIpAddresses: function() {
    return this.get('targetsArray').filterProperty('isIp',true).map((choice) => {
      return Ember.get(choice,'value');
    });
  }.property('targetsArray.@each.{isIp,isContainer,value}'),

  validate: function() {
    var config = this.get('model.config');
    var balancer = this.get('model.balancer');

    config.set('name', balancer.get('name'));
    config.set('description', balancer.get('description'));

    return true;
  },

  doneSaving: function() {
    this.transitionToRoute('targets');
  },
});
