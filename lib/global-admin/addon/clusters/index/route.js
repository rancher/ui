import { next } from '@ember/runloop';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  access:      service(),
  shortcuts:   { 'g': 'toggleGrouping', },

  model(){
    return hash({
      clusters:         this.globalStore.findAll('cluster'),
      clusterTemplates: this.globalStore.findAll('clustertemplate'),
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

    let { me: { hasAdmin: globalAdmin = false } } = this.access;

    let { clusterTemplates = [] } = model;

    if (clusterTemplates.length <= 0 && !globalAdmin) {
      controller.set('disabledAddCluster', true);
    }
  },

  actions:   {
    toggleGrouping() {
      let choices = ['list', 'grouped'];
      let cur = this.get('controller.mode');
      let neu = choices[((choices.indexOf(cur) + 1) % choices.length)];

      next(() => {
        this.set('controller.mode', neu);
      });
    },
  },

});
