import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import EditService from 'ui/mixins/edit-service';
import EditTargetIp from 'ui/mixins/edit-targetip';
import C from 'ui/utils/constants';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Component.extend(NewOrEdit, EditService, EditTargetIp, {
  editing: true,
  loading: true,

  actions: {
    addServiceLink:        addAction('addServiceLink',  '.service-link'),
    addTargetIp:           addAction('addTargetIp',     '.target-ip'),

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

    this.get('store').find('environment', service.get('environmentId')).then((env) => {
      env.importLink('services').then(() => {
        var model = Ember.Object.create({
          service: service.clone(),
          selectedEnvironment: env
        });

        this.setProperties({
          originalModel: service,
          model: model,
          service: model.service,
          environment: model.selectedEnvironment,
        });

        this.initFields();
        this.set('loading', false);
      });
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

  hasServiceLinks: function() {
    return this.get('service.type').toLowerCase() !== 'externalservice';
  }.property('service.type'),

  hasTargetIp: function() {
    return this.get('service.type').toLowerCase() === 'externalservice';
  }.property('service.type'),

  doneSaving: function() {
    this.sendAction('dismiss');
  }
});
