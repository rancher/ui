import Ember from 'ember';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';

const OLD_STACK_ID = C.EXTERNALID.KIND_SYSTEM + C.EXTERNALID.KIND_SEPARATOR + C.EXTERNALID.KIND_MESOS;
const NEW_STACK_PREFIX = C.EXTERNALID.KIND_SYSTEM_CATALOG + C.EXTERNALID.KIND_SEPARATOR + C.CATALOG.LIBRARY_KEY + C.EXTERNALID.GROUP_SEPARATOR + C.EXTERNALID.KIND_MESOS + C.EXTERNALID.GROUP_SEPARATOR;

export default Ember.Component.extend({
  mesos: Ember.inject.service(),

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
    'Add at least three hosts',
    'Waiting for hosts to be active',
    'Creating Mesos system stack',
    'Starting services',
    'Waiting for leading Mesos Master'
  ],

  updateStep: debouncedObserver('model.hosts.@each.state','model.stacks.@each.{state,externalId}','services.@each.{state,healthState}', function() {
    this.set('subStep', 0);
    this.set('subCount', 0);

    if ( (this.get('model.hosts.length') + this.get('model.machines.length')) < 3 )
    {
      this.set('currentStep', 0);
      return;
    }

    if ( this.get('model.hosts').filterBy('state','active').get('length') < 2 )
    {
      this.set('currentStep', 1);
      return;
    }

    var stack = this.get('model.stacks').filter((stack) => {
      let externalId = stack.get('externalId')||'';
      return externalId === OLD_STACK_ID || externalId.indexOf(NEW_STACK_PREFIX) === 0;
    })[0];

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

    var services = (this.get('services')||[]).filterBy('environmentId', stack.get('id'));
    var num = services.get('length');
    var healthy = services.filterBy('healthState','healthy').get('length');
    if ( num === 0 || healthy < num )
    {
      this.setProperties({
        currentStep: 3,
        subStep: healthy,
        subCount: num
      });
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
