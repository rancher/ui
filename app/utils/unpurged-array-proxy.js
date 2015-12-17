import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  sourceContent: null,
  sortProperties: null,

  init: function() {
    if ( !this.get('sortProperties') )
    {
      this.set('sortProperties', ['displayName','name','id']);
    }
    this.sourceContentChanged();
    this._super();
  },

  sourceContentChanged: function() {
    var x = (this.get('sourceContent')||[]).filter(function(item) {
      return (Ember.get(item,'state')||'').toLowerCase() !== 'purged';
    });
    this.set('content', x);
  }.observes('sourceContent.@each.state'),

  // The array proxy gets it's data from here
  arrangedContent: Ember.computed.sort('content','sortProperties'),
});
