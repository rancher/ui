import Ember from "ember";

export default Ember.Component.extend({
  activeTab: null,
  classNames: ['no-select'],

  tagName: 'nav',
  hasServices: function() {
    var store = this.get('store');
    return store && store.hasRecordFor('schema','service');
  }.property(),
});
