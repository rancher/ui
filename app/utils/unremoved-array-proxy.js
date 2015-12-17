import Ember from 'ember';

var undesireable = ['removed','purging','purged'];

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
      return undesireable.indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
    });
    this.set('content', x);
  }.observes('sourceContent.@each.state'),

  // The array proxy reads this property
  arrangedContent: Ember.computed.sort('content','sortProperties'),
});
