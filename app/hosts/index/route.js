import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('host').then((hosts) => {
      return {
        hosts: hosts,
      };
    });
  },

  actions: {
    toggleGrouping() {
      let choices = ['list','dot','grouped'];
      let cur = this.get('controller.mode');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      this.set('controller.mode', neu);
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
