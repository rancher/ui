import Ember from 'ember';

export default Ember.ArrayProxy.extend(Ember.SortableMixin, {
  sourceContent: null,

  init: function() {
    if ( !this.get('sortProperties') )
    {
      this.set('sortProperties', ['name','id']);
    }
    this._super();
    this.set('content', []);
  },

  sourceContentChanged: function() {
    var x = (this.get('sourceContent')||[]).filter(function(item) {
      return ['removed','purging','purged'].indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
    });
    this.set('content', x);
  }.observes('sourceContent.@each.state').on('init'),
});
