import Ember from 'ember';

export default Ember.Component.extend({
  choices    : null,
  index      : null,

  batchSize  : 1,
  interval   : 2,
  startFirst : false,

  init() {
    this._super(...arguments);

    this.optionsDidChange();
  },

  optionsDidChange: function() {
    this.sendAction('optionsChanged', {
      batchSize: parseInt(this.get('batchSize'),10),
      intervalMillis: parseInt(this.get('interval'),10)*1000,
      startFirst: this.get('startFirst'),
    });
  }.observes('batchSize','interval','startFirst'),

  choicesDidChange: function() {
    var index = this.get('index');
    var obj = this.get('choices').filterBy('index',index)[0];
    if ( !obj || !obj.enabled ) {
      var first = this.get('choices').filterBy('enabled',true)[0];
      if ( first )
      {
        this.sendAction('switch', first.index);
      }
      else
      {
        this.sendAction('switch', null);
      }
    }
  }.observes('choices.@each.enabled'),

  hasSidekicks: function() {
    return this.get('choices.length') > 1;
  }.property('choices.length'),
});
