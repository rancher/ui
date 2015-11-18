import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['driverName'],
  driverName: null,

  primaryResource: Ember.computed.alias('model.volume'),

  doneSaving() {
    this.transitionToRoute('storagepools');
  },

  actions: {
    cancel() {
      this.send('goToPrevious');
    },
  }
});
