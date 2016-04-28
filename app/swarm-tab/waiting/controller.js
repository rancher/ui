import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  authenticated: Ember.inject.controller(),

  timer: null,
  currentStep: 0,

  steps: [
    'Add at least one host',
    'Waiting for a host to be active',
    'Creating Swarm system stack',
    'Starting services',
  ],

  updateStep: debouncedObserver('model.hosts.@each.state','model.stacks.@each.{state,externalId}','model.services.@each.{state}', function() {
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

    var stack = this.get('model.stacks').filterBy('externalId','system://swarm')[0];
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
    var active = services.filterBy('state','active').get('length');
    if ( num === 0 || active < num )
    {
      this.set('currentStep', 3);
      return;
    }

    this.set('currentStep', 4);
    this.set('authenticated.swarmReady', true);
  }),

  onInit: function() {
    this.updateStep();
  }.on('init'),

  stepChanged: function(){
    if ( this.get('currentStep') === 4 )
    {
      this.transitionToRoute('swarm-tab.projects');
    }
  }.observes('currentStep'),
});
