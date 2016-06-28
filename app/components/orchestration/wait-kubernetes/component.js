import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  k8s: Ember.inject.service(),
  settings: Ember.inject.service(),

  timer: null,
  currentStep: 0,
  subStep: 0,
  subCount: 0,
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
    'Creating Kubernetes system stack',
    'Starting services',
    'Waiting for Kubernetes API',
    'Creating Namespace',
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

    var stack = this.get('k8s').filterSystemStack(this.get('model.stacks'));
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
    this.get('k8s').isReady().then((ready) => {
      if ( ready )
      {
        this.get('k8s').getNamespace('default',true).then(() => {
          this.set('currentStep', 6);
        }).catch(() => {
          this.set('currentStep', 5);
          reschedule();
        });
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

  stepChanged: function(){
    if ( this.get('currentStep') >= this.get('steps.length') )
    {
      this.sendAction('ready');
    }
  }.observes('currentStep','steps.length'),
});
