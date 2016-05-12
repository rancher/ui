import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  title: 'Go to documentation',
  link: '',
  target: '_blank',

  tagName: 'A',
  attributeBindings: ['title','href', 'target'],
  classNames: ['small'],
  classNameBindings: ['settings.isRancher::hide'],

  href: function() {
    return this.get('settings.docsBase') + this.get('link');
  }.property('link')

});
