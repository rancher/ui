import Ember from 'ember';

export default Ember.Component.extend({
  requestObject: null,
  requestJSON: null,
  responseObject: null,
  responseJSON: null,

  didInitAttrs: function() {
    this.set('requestJSON', JSON.stringify(this.get('requestObject'), null,2));
    this.set('responseJSON', JSON.stringify(this.get('responseObject'), null,2));
    Ember.run.next(() =>{
      this.highlightAll();
    });
  },

  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    }
  },

  highlightAll: function() {
    this.$('CODE').each(function(idx, elem) {
      Prism.highlightElement(elem);
    });
  },
});
