import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    toggleGrouping() {
      let choices = ['list','grouped'];
      let cur = this.get('controller.mode');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      Ember.run.next(() => {
        this.set('controller.mode', neu);
      });
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
