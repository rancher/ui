import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  swarm       : Ember.inject.service(),

  currentStep : 0,
  subStep     : 0,
  subCount    : 0,
  services    : null,

  init() {
    this._super(...arguments);

    this.updateStep();
    this.get('store').findAllUnremoved('service').then((services) => {
      this.set('services', services);
    });
  },

  steps: [
    'waitSwarm.addHost',
    'waitSwarm.activateHost',
    'waitSwarm.createStack',
    'waitSwarm.startService',
  ],

  updateStep: debouncedObserver('model.hosts.@each.state','model.stacks.@each.{state,externalId}','services.@each.{state,healthState}', function() {
    this.set('subStep', 0);
    this.set('subCount', 0);

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

    var stack = this.get('swarm').filterSystemStack(this.get('model.stacks'));
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
        this.set('currentStep', 3);
        return;
      }
    }

    var services = (this.get('services')||[]).filterBy('environmentId', stack.get('id'));
    var num = services.get('length');
    var healthy = Util.filterByValues(services, 'healthState', C.READY_STATES).get('length');
    if ( num === 0 || healthy < num )
    {
      this.setProperties({
        currentStep: 3,
        subStep: healthy,
        subCount: num
      });
      return;
    }

    this.set('currentStep', 4);
  }),

  stepChanged: function(){
    if ( this.get('currentStep') >= this.get('steps.length') )
    {
      this.sendAction('ready');
    }
  }.observes('currentStep','steps.length'),
});
