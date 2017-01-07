import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  k8s         : Ember.inject.service(),
  settings    : Ember.inject.service(),

  timer       : null,
  currentStep : 0,
  subStep     : 0,
  subCount    : 0,

  services    : null,
  hosts       : null,
  stacks      : null,

  init() {
    this._super(...arguments);

    let store = this.get('store');
    this.set('services', store.all('service'));
    this.set('hosts', store.all('host'));
    this.set('stacks', store.all('stack'));
    this.updateStep();
  },

  willDestroyElement() {
    Ember.run.cancel(this.get('timer'));
  },

  steps: [
    'waitKubernetes.addHost',
    'waitKubernetes.activateHost',
    'waitKubernetes.createStack',
    'waitKubernetes.startServices',
    'waitKubernetes.waitApi',
  ],

  updateStep: debouncedObserver('hosts.@each.state','stacks.@each.{state,externalId}','services.@each.{state,healthState}', function() {
    this.set('subStep', 0);
    this.set('subCount', 0);

    if ( this.get('hosts.length') === 0 )
    {
      this.set('currentStep', 0);
      return;
    }

    if ( this.get('hosts').filterBy('state','active').get('length') === 0 )
    {
      this.set('currentStep', 1);
      return;
    }

    var stack = this.get('k8s').filterSystemStack(this.get('stacks'));
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

    var services = (this.get('services')||[]).filterBy('stackId', stack.get('id'));
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

  stepChanged: function(){
    if ( this.get('currentStep') >= this.get('steps.length') )
    {
      this.sendAction('ready');
    }
  }.observes('currentStep','steps.length'),
});
