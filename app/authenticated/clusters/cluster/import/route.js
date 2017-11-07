import EmberObject from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  settings: service(),

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

  model() {
    let settings = this.get('settings');
    return settings.load(C.SETTING.API_HOST).then(() => {
      return EmberObject.create({
        apiHostSet: !!settings.get(C.SETTING.API_HOST),
      });
    });
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
