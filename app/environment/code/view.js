import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    this.highlightAll();
  },

  highlightAll: function() {
    this.$('CODE').each(function(idx, elem) {
      Prism.highlightElement(elem);
    });
  },

  yamlChanged: function() {
    this.highlightAll();
  }.observes('composeConfig.{dockerComposeConfig,rancherComposeConfig}'),
});
