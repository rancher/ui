import Ember from 'ember';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  pipelineSvc: Ember.inject.service('pipeline'),

  projectId   : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),

  timer       : null,
  ready: false,

  services    : null,
  hosts       : null,
  stacks      : null,

  pipelineURL: function(){
    return this.get('pipelineSvc.pipelinesUIPoint');
  }.property('pipelineSvc.pipelinesUIPoint'),

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

  updateStep: debouncedObserver('hosts.@each.state','stacks.@each.{state,externalId}','services.@each.{state,healthState}', function() {
    this.get('pipelineSvc').isReady().then(({has,ready}) => {
      if ( ready )
      {
        this.set('ready', true);
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
  })
});
