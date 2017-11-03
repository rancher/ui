import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['progress'],

  color: '',
  min: 0,
  value: 0,
  max: 100,
  zIndex: null,

  percent: function() {
    var min   = this.get('min');
    var max   = this.get('max');
    var value = Math.max(min, Math.min(max, this.get('value')));

    var per = value/(max-min)*100; // Percent 0-100
    per = Math.round(per*100)/100; // Round to 2 decimal places
    return per;
  }.property('min','max','value'),

  colorClass: function() {
    var color = this.get('color');
    if ( !color )
    {
      return;
    }

    return 'progress-bar-' + color.replace(/^progress-bar-/,'');
  }.property('color'),

  percentDidChange: function() {
    this.$('.progress-bar').css('width', this.get('percent') + "%");
  }.observes('percent'),

  zIndexDidChange: function() {
    this.$().css('zIndex', this.get('zIndex') || "inherit");
  }.observes('zIndex'),

  didInsertElement: function() {
    this.percentDidChange();
    this.zIndexDidChange();
  },
});
