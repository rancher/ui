import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    }
  },

  availableProjectTemplates: Ember.computed.filterBy('model.projectTemplates','allThere',true),
});
