import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['banner'],
  classNameBindings: ['color'],

  showIcon: function() {
    let title = this.get('title');
    return title === null || title === undefined;
  }.property('title'),

  color: 'bg-default',
  icon: 'icon icon-info',
  title: null,
  message: '',
});
