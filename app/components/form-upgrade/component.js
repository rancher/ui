import Ember from 'ember';

export default Ember.Component.extend({
  choices: null,
  index: null,

  batchSize: 1,
  interval: 2,
  startFirst: false,

  didInitAttrs() {
    this.optionsChanged();
  },

  optionsChanged: function() {
    this.sendAction('optionsChanged', {
      batchSize: this.get('batchSize'),
      intervalMillis: this.get('interval')*1000,
      startFirst: this.get('startFirst'),
    });
  }.observes('batchSize','interval','startFirst'),

  choicesChanged: function() {
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
