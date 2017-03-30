import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['banner'],
  classNameBindings: ['color'],

  showIcon: function() {
    let value = this.get('value');
    return value === null || value === undefined;
  }.property('value'),

  color: 'bg-default',
  icon: 'icon icon-info',
  value: null,
  message: '',
});
