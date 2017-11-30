import { next } from '@ember/runloop';
import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
  },
  actions: {
    toggleGrouping() {
      let choices = ['list','grouped'];
      let cur = this.get('controller.mode');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      next(() => {
        this.set('controller.mode', neu);
      });
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
