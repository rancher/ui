import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  actions: {
    optionsChanged: function(opt) {
      this.get('model').setProperties(opt);
    }
  }
});
