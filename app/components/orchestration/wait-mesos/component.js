import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Component.extend({
  mesos: Ember.inject.service(),

  timer: null,
  currentStep: 0,
  services: null,

  didInitAttrs() {
    this.updateStep();
    this.get('store').findAllUnremoved('service').then((services) => {
      this.set('services', services);
    });
  },

  willDestroyElement() {
    Ember.run.cancel(this.get('timer'));
  },

  steps: [
    'Add at least one host',
    'Waiting for a host to be active',
    'Creating Mesos system stack',
    'Starting services',
    'Waiting for leading Mesos Master'
  ],

  updateStep: debouncedObserver('model.hosts.@each.state','model.stacks.@each.{state,externalId}','services.@each.state', function() {
    if ( (this.get('model.hosts.length') + this.get('model.machines.length')) === 0 )
    {
      this.set('currentStep', 0);
      return;
    }

    if ( this.get('model.hosts').filterBy('state','active').get('length') === 0 )
    {
      this.set('currentStep', 1);
      return;
    }

    var stack = this.get('model.stacks').filterBy('externalId','system://mesos')[0];
    if ( !stack )
    {
      this.set('currentStep', 2);
      return;
    }

    if ( stack.get('state') !== 'active' )
    {
      if ( stack.get('state') === 'inactive' )
      {
        stack.doAction('activate');
      }

      this.set('currentStep', 3);
      return;
    }

    var services = this.get('services');
    if ( !services )
    {
      this.set('currentStep', 3);
      return;
    }

    var inStack = services.filterBy('environmentId', stack.get('id'));
    var num = inStack.get('length');
    var active = inStack.filterBy('state','active').get('length');
    if ( num === 0 || active < num )
    {
      this.set('currentStep', 3);
      return;
    }

    this.get('mesos').isReady().then((ready) => {
      if ( ready )
      {
        this.set('currentStep', 5);
      }
      else
      {
        this.set('currentStep', 4);
        reschedule();
      }
    }).catch(() => {
      this.set('currentStep', 4);
      reschedule();
    });

    var self = this;
    function reschedule() {
      self.set('timer', Ember.run.later(self, 'updateStep', 5000));
    }
  }),

  stepChanged: function(){
    if ( this.get('currentStep') >= this.get('steps.length') )
    {
      this.sendAction('ready');
    }
  }.observes('currentStep','steps.length'),
});
