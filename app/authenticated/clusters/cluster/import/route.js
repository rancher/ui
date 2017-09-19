import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

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

  model() {
    let settings = this.get('settings');
    return settings.load(C.SETTING.API_HOST).then(() => {
      return Ember.Object.create({
        apiHostSet: !!settings.get(C.SETTING.API_HOST),
      });
    });
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
