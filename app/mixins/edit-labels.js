import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    addLabel: function() {
      this.get('labelsArray').pushObject({
        key: '',
        value: '',
      });
    },

    removeLabel: function(obj) {
      this.get('labelsArray').removeObject(obj);
    },
  },

  labelsArray: null,

  initFields: function() {
    this._super();
    this.initLabels();
  },

  initLabels: function() {
  }
});
