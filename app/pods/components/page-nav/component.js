import Ember from "ember";

export default Ember.Component.extend({
  activeTab: null,

  tagName: 'nav',
  hasRegistries: function() {
    return this.get('store').hasRecordFor('schema','registry');
  }.property(),
});
