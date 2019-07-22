import { next } from '@ember/runloop';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  shortcuts:   { 'g': 'toggleGrouping', },
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

  model(){
    return hash({ clusterTemplates: this.globalStore.findAll('clustertemplate') });
  },

  setupController(controller, model) {
    let { clusterTemplates = [] } = model;

    if (clusterTemplates.length <= 0) {
      controller.set('disabledAddCluster', true);
    }
  },

});
