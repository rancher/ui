import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Controller.extend({
  mesos: Ember.inject.service(),
  settings: Ember.inject.service(),

  timer: null,
  currentStep: 0,

  steps: [
    'Add at least one host',
    'Waiting for a host to be active',
    'Creating Mesos system stack',
    'Starting services',
    'Waiting for leading Mesos Master'
  ],

  updateStep: debouncedObserver('model.hosts.@each.state','model.stacks.@each.{state,externalId}', function() {
    console.log('updateStep');
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

    var services = this.get('model.services').filterBy('environmentId', stack.get('id'));
    var num = services.get('length');
    console.log('num='+num);
    var active = services.filterBy('state','active').get('length');
    console.log('active='+active);
    if ( num === 0 || active < num )
    {
      this.set('currentStep', 3);
      return;
    }

    this.set('currentStep', 4);
    this.get('mesos').isReady().then((ready) => {
      console.log('ready='+ready);
      if ( ready )
      {
        this.set('currentStep', 5);
      }
      else
      {
        reschedule();
      }
    }).catch(() => {
      reschedule();
    });

    var self = this;
    function reschedule() {
      self.set('timer', Ember.run.later(self, 'updateStep', 5000));
    }
  }),

  onInit: function() {
    this.updateStep();
  }.on('init'),

  stepChanged: function(){
    if ( this.get('currentStep') === 5 )
    {
      this.send('refreshMesos');
      console.log('transitioning!!');
      this.transitionToRoute('mesos.index');
    }
  }.observes('currentStep'),

  deactivate() {
    Ember.run.cancel(this.get('timer'));
  }
});
