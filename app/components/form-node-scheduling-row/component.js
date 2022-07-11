import Component from '@ember/component';
import layout from './template';
import { set, observer } from '@ember/object';

const PRIORITY = ['required', 'preferred']

export default Component.extend({
  layout,
  editing:  true,
  term:     [],
  priority: 'required',

  init() {
    this._super(...arguments);
    this.initPriorityChoices();
  },

  actions: {
    remove() {
      if (this.remove) {
        this.remove(this.model);
      }
    },

  },

  termsChanged: observer('model.nodeSelectorTerms.matchExpressions.@each.{key,operater,values}', 'model.priority', function() {
    if (this.update) {
      this.update();
    }
  }),

  initPriorityChoices() {
    set(this, 'priorityChoices', PRIORITY.map((k) => {
      return {
        translationKey: `nodeDriver.harvester.scheduling.input.priority.${ k }`,
        value:          k,
      };
    }));
  },

});
