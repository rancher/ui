import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  sourceContent: null,

  init: function() {
    this._super();
    this.set('content', []);
  },

  sourceContentChanged: function() {
    var x = this.get('sourceContent').filter(function(item) {
      return item.get('state').toLowerCase() !== 'purged';
    });
    this.set('content', x);
  }.observes('sourceContent.@each.state').on('init'),
});
