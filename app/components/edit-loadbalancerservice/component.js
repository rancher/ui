import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import EditService from 'ui/mixins/edit-service';
import EditBalancerConfig from 'ui/mixins/edit-loadbalancerconfig';
import EditBalancerTarget from 'ui/mixins/edit-balancer-target';
import C from 'ui/utils/constants';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Component.extend(NewOrEdit, EditService, EditBalancerConfig, EditBalancerTarget, {
  allServices: Ember.inject.service(),

  editing: true,
  loading: true,
  isAdvanced: true,

  actions: {
    addServiceLink:        addAction('addServiceLink',  '.service-link'),
    addTargetIp:           addAction('addTargetIp',     '.target-ip'),

    addTargetService: function() {
      this.get('targetsArray').pushObject({isService: true});
    },

    removeTarget: function(tgt) {
      this.get('targetsArray').removeObject(tgt);
    },

    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  loadDependencies: function() {
    var service = this.get('originalModel');

    var dependencies = [
      this.get('allServices').choices(),
    ];

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then((results) => {
      var clone = service.clone();
      var model = Ember.Object.create({
        service: clone,
        allServices: results[0],
      });

      this.setProperties({
        originalModel: service,
        model: model,
        service: clone,
      });

      this.initFields();
      this.initListeners(clone);
      this.initTargets(clone);
      this.set('loading', false);
    });
  },

  canScale: function() {
    if ( ['service','loadbalancerservice'].indexOf(this.get('service.type').toLowerCase()) >= 0 )
    {
      return !this.getLabel(C.LABEL.SCHED_GLOBAL);
    }
    else
    {
      return false;
    }
  }.property('service.type'),

  isBalancer: true,
  hasServiceLinks: true,
  hasTargetIp: false,

  didSave: function() {
    var balancer = this.get('service');
    // Set balancer targets
    return balancer.waitForNotTransitioning().then(() => {
      return balancer.doAction('setservicelinks', {
        serviceLinks: this.get('targetResources'),
      });
    });
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  },
});
